import "server-only";
import { listActiveRulesForAccount, markSocialEventReplied, recordSocialEventIfNew } from "@/lib/repositories/social-auto-reply-repository";
import { getSocialAccountById } from "@/lib/repositories/social-accounts-repository";
import { replyToFacebookComment, replyToInstagramComment, sendFacebookDirectMessage } from "@/lib/social/meta";
import { sendWhatsAppTextMessage } from "@/lib/social/whatsapp";
import type { SocialAutoReplyRule, SocialPlatform, SocialTriggerType } from "@/lib/types/social";

/** First active rule whose keywords all appear in the message (case/accent-insensitive) — an empty keyword list matches anything, for a catch-all rule. */
function matchRule(rules: SocialAutoReplyRule[], messageText: string): SocialAutoReplyRule | null {
  const normalized = messageText.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.length === 0) return rule;
    const allMatch = rule.keywords.every((keyword) =>
      normalized.includes(keyword.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()),
    );
    if (allMatch) return rule;
  }
  return null;
}

export interface IncomingSocialEvent {
  tenantId: string;
  accountId: string;
  platform: SocialPlatform;
  eventType: SocialTriggerType;
  /** Comment id or conversation/sender id from the platform's webhook payload — used both for idempotency and, on a match, to know where to send the reply. */
  externalEventId: string;
  senderName: string;
  messageText: string;
  /** Comment id to reply under (comments only) or the DM sender's psid (dm only) — see the two Meta reply calls below, which need different ids than externalEventId in some payload shapes. */
  replyTargetId: string;
}

/**
 * Records an incoming comment/DM and, if an active rule matches, sends
 * the reply immediately. Called from the Meta webhook route — see
 * app/api/social/webhooks/meta/route.ts (Facebook/Instagram/WhatsApp all
 * arrive there). TikTok has no public comment/DM API to react to (see
 * lib/social/tiktok.ts's doc comment), so it's excluded here; a tiktok
 * account can still have rules saved, they just never fire until TikTok
 * exposes that surface.
 */
export async function handleIncomingSocialEvent(input: IncomingSocialEvent): Promise<void> {
  const event = await recordSocialEventIfNew(input.tenantId, {
    accountId: input.accountId,
    platform: input.platform,
    eventType: input.eventType,
    externalEventId: input.externalEventId,
    senderName: input.senderName,
    messageText: input.messageText,
  });
  if (!event) return; // Already processed — a webhook retry.

  const rules = await listActiveRulesForAccount(input.accountId, input.eventType);
  const matched = matchRule(rules, input.messageText);
  if (!matched) return;

  const account = await getSocialAccountById(input.tenantId, input.accountId);
  if (!account) return;

  try {
    if (input.eventType === "comment") {
      if (account.platform === "meta_facebook") {
        await replyToFacebookComment(input.replyTargetId, account.accessToken, matched.replyTemplate);
      } else if (account.platform === "meta_instagram") {
        await replyToInstagramComment(input.replyTargetId, account.accessToken, matched.replyTemplate);
      }
    } else if (input.eventType === "dm" && account.platform === "meta_facebook") {
      await sendFacebookDirectMessage(account.externalAccountId, account.accessToken, input.replyTargetId, matched.replyTemplate);
    } else if (input.eventType === "dm" && account.platform === "whatsapp") {
      await sendWhatsAppTextMessage(account.externalAccountId, account.accessToken, input.replyTargetId, matched.replyTemplate);
    }

    await markSocialEventReplied(event.id, { matchedRuleId: matched.id, replied: true, replyText: matched.replyTemplate });
  } catch (error) {
    await markSocialEventReplied(event.id, {
      matchedRuleId: matched.id,
      replied: false,
      replyError: error instanceof Error ? error.message : "Error desconocido al responder.",
    });
  }
}
