import { NextResponse } from "next/server";
import { findSocialPostIdByExternalId, markSocialPostStatus } from "@/lib/repositories/social-posts-repository";

/**
 * TikTok's Content Posting webhook — notifies this endpoint when a video
 * submitted via lib/social/tiktok.ts publishTikTokVideo() finishes (or
 * fails) processing, since PULL_FROM_URL publishing is asynchronous.
 * Configure this URL under TikTok Developer Portal → your app → Webhooks.
 *
 * NOTE: unlike Meta, TikTok has no public comment/DM webhook for
 * ordinary apps (see lib/social/tiktok.ts's doc comment) — this route
 * only ever handles publish-status events, never auto-replies.
 *
 * NOTE ON VERIFICATION: this only checks that `client_key` in the body
 * matches this app's own key, which stops accidental cross-app posts but
 * is not cryptographic proof the request came from TikTok. TikTok's
 * current webhook signing scheme should be re-checked against
 * https://developers.tiktok.com before relying on this in production —
 * it wasn't verified against a live TikTok app when this was written.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    client_key?: string;
    event?: string;
    content?: string;
  } | null;

  if (!body || body.client_key !== process.env.TIKTOK_CLIENT_KEY) {
    return NextResponse.json({ error: "client_key inválido" }, { status: 401 });
  }

  const content = body.content ? (JSON.parse(body.content) as { publish_id?: string; publish_status?: string }) : null;
  if (!content?.publish_id) {
    return NextResponse.json({ ok: true });
  }

  const postId = await findSocialPostIdByExternalId(content.publish_id);
  if (postId) {
    if (content.publish_status === "PUBLISH_COMPLETE") {
      await markSocialPostStatus(postId, "published", { publishedAt: new Date().toISOString(), errorMessage: null });
    } else if (content.publish_status === "FAILED") {
      await markSocialPostStatus(postId, "failed", { errorMessage: `TikTok reportó un fallo de publicación (${body.event ?? "evento desconocido"}).` });
    }
  }

  return NextResponse.json({ ok: true });
}
