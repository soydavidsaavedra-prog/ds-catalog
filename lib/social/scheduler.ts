import "server-only";
import { listDueSocialPosts, markSocialPostStatus } from "@/lib/repositories/social-posts-repository";
import { getSocialAccountById, updateSocialAccountStatus } from "@/lib/repositories/social-accounts-repository";
import { publishToFacebookPage, publishToInstagram, isMetaTokenExpiredError } from "@/lib/social/meta";
import { publishTikTokVideo } from "@/lib/social/tiktok";
import type { SocialAccount, SocialPost } from "@/lib/types/social";

async function publishOne(post: SocialPost, account: SocialAccount): Promise<{ externalPostId: string }> {
  switch (account.platform) {
    case "meta_facebook":
      return publishToFacebookPage(account.externalAccountId, account.accessToken, post.content, post.mediaUrls);
    case "meta_instagram":
      return publishToInstagram(account.externalAccountId, account.accessToken, post.content, post.mediaUrls);
    case "tiktok": {
      const videoUrl = post.mediaUrls[0];
      if (!videoUrl) throw new Error("TikTok requiere un video — no se puede publicar sin uno.");
      return publishTikTokVideo(account.accessToken, post.content, videoUrl);
    }
    case "whatsapp":
      // Never reachable in practice — SOCIAL_PLATFORMS_WITHOUT_POSTS keeps WhatsApp accounts out of the composer, so no post ever references one.
      throw new Error("WhatsApp no tiene publicaciones/feed — esta cuenta no debería tener posts programados.");
  }
}

/**
 * Publishes every social post whose scheduled_at has arrived — called by
 * app/api/cron/social-publish/route.ts on a timer (see vercel.json). Not
 * tenant-scoped: it works across every tenant's queue in one pass, same
 * as any other platform-wide cron in this app.
 */
export async function processDueSocialPosts(): Promise<{ processed: number; failed: number }> {
  const due = await listDueSocialPosts(new Date());
  let processed = 0;
  let failed = 0;

  for (const post of due) {
    await markSocialPostStatus(post.id, "publishing");
    try {
      const account = await getSocialAccountById(post.tenantId, post.accountId);
      if (!account || account.status !== "active") {
        throw new Error("La cuenta conectada ya no está disponible — reconéctala desde /admin/redes-sociales/cuentas.");
      }

      const { externalPostId } = await publishOne(post, account);
      await markSocialPostStatus(post.id, "published", {
        externalPostId,
        publishedAt: new Date().toISOString(),
        errorMessage: null,
      });
      processed += 1;
    } catch (error) {
      if (isMetaTokenExpiredError(error)) {
        await updateSocialAccountStatus(post.tenantId, post.accountId, "expired");
      }
      await markSocialPostStatus(post.id, "failed", {
        errorMessage: error instanceof Error ? error.message : "Error desconocido al publicar.",
      });
      failed += 1;
    }
  }

  return { processed, failed };
}
