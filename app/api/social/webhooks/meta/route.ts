import { NextResponse } from "next/server";
import { verifyMetaWebhookChallenge, verifyMetaWebhookSignature } from "@/lib/social/meta";
import { getSocialAccountByExternalId } from "@/lib/repositories/social-accounts-repository";
import { handleIncomingSocialEvent } from "@/lib/social/auto-reply";

/**
 * Meta's single webhook endpoint for Page (Facebook comments/DMs),
 * Instagram, and WhatsApp subscriptions — configure this same URL for
 * all three objects in the App Dashboard → Webhooks. See lib/social/meta.ts
 * and lib/social/whatsapp.ts for the signature/handshake helpers and
 * lib/social/auto-reply.ts for what happens once an event is identified.
 */

/** Meta's one-time subscription handshake: it GETs this URL with a challenge and expects it echoed back verbatim, but only if hub.verify_token matches what you configured. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (verifyMetaWebhookChallenge(mode, token) && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verificación fallida" }, { status: 403 });
}

interface MetaWebhookEntry {
  id: string;
  changes?: { field: string; value: Record<string, unknown> }[];
  messaging?: { sender: { id: string }; message?: { mid: string; text?: string } }[];
}

interface WhatsAppChangeValue {
  metadata?: { phone_number_id?: string };
  contacts?: { profile?: { name?: string }; wa_id?: string }[];
  messages?: { from: string; id: string; type: string; text?: { body?: string } }[];
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!(await verifyMetaWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { object: string; entry?: MetaWebhookEntry[] };

  if (payload.object === "whatsapp_business_account") {
    await handleWhatsAppEntries(payload.entry ?? []);
    return NextResponse.json({ ok: true });
  }

  const platform = payload.object === "instagram" ? "meta_instagram" : "meta_facebook";

  for (const entry of payload.entry ?? []) {
    const account = await getSocialAccountByExternalId(platform, entry.id);
    if (!account) continue; // A Page/account this app isn't tracking — ignore rather than error, since Meta retries on non-2xx.

    for (const change of entry.changes ?? []) {
      if (change.field !== "feed" && change.field !== "comments") continue;
      const value = change.value as { item?: string; comment_id?: string; from?: { name?: string }; message?: string; text?: string };
      if (value.item !== "comment" && !value.comment_id) continue;

      await handleIncomingSocialEvent({
        tenantId: account.tenantId,
        accountId: account.id,
        platform,
        eventType: "comment",
        externalEventId: value.comment_id ?? `${entry.id}:${Date.now()}`,
        senderName: value.from?.name ?? "",
        messageText: value.message ?? value.text ?? "",
        replyTargetId: value.comment_id ?? "",
      });
    }

    for (const message of entry.messaging ?? []) {
      if (!message.message?.text) continue;
      await handleIncomingSocialEvent({
        tenantId: account.tenantId,
        accountId: account.id,
        platform,
        eventType: "dm",
        externalEventId: message.message.mid,
        senderName: "",
        messageText: message.message.text,
        replyTargetId: message.sender.id,
      });
    }
  }

  // Always 200 — a non-2xx makes Meta retry the same delivery repeatedly, and any real failure is already captured per-event in ds_social_events.reply_error.
  return NextResponse.json({ ok: true });
}

/**
 * WhatsApp's payload shape is unlike Page/Instagram: `entry.id` is the
 * WhatsApp Business Account id, not the individual phone number, so the
 * account lookup below uses `value.metadata.phone_number_id` instead —
 * that's the id stored as ds_social_accounts.external_account_id when a
 * number is connected (see connectWhatsAppAccountAction).
 */
async function handleWhatsAppEntries(entries: MetaWebhookEntry[]): Promise<void> {
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value as WhatsAppChangeValue;
      const phoneNumberId = value.metadata?.phone_number_id;
      if (!phoneNumberId) continue;

      const account = await getSocialAccountByExternalId("whatsapp", phoneNumberId);
      if (!account) continue;

      for (const message of value.messages ?? []) {
        if (message.type !== "text" || !message.text?.body) continue;
        const senderName = value.contacts?.find((c) => c.wa_id === message.from)?.profile?.name ?? "";

        await handleIncomingSocialEvent({
          tenantId: account.tenantId,
          accountId: account.id,
          platform: "whatsapp",
          eventType: "dm",
          externalEventId: message.id,
          senderName,
          messageText: message.text.body,
          replyTargetId: message.from,
        });
      }
    }
  }
}
