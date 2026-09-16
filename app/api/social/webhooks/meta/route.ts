import { NextResponse } from "next/server";
import { verifyMetaWebhookChallenge, verifyMetaWebhookSignature } from "@/lib/social/meta";
import { getSocialAccountByExternalId } from "@/lib/repositories/social-accounts-repository";
import { handleIncomingSocialEvent } from "@/lib/social/auto-reply";

/**
 * Meta's single webhook endpoint for both Page (Facebook comments/DMs)
 * and Instagram subscriptions — configure this same URL for both objects
 * in the App Dashboard → Webhooks. See lib/social/meta.ts for the
 * signature/handshake helpers and lib/social/auto-reply.ts for what
 * happens once an event is identified.
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

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!(await verifyMetaWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { object: string; entry?: MetaWebhookEntry[] };
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
