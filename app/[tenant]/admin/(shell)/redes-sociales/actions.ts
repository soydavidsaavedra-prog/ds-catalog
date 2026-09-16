"use server";

import { revalidatePath } from "next/cache";
import {
  createSocialPost,
  deleteSocialPost,
} from "@/lib/repositories/social-posts-repository";
import {
  deleteSocialAccount,
  getSocialAccountById,
  upsertSocialAccount,
} from "@/lib/repositories/social-accounts-repository";
import {
  createAutoReplyRule,
  deleteAutoReplyRule,
  setAutoReplyRuleActive,
} from "@/lib/repositories/social-auto-reply-repository";
import { recordMetricsSnapshot } from "@/lib/repositories/social-metrics-repository";
import { getFacebookPageInsights, getInstagramInsights, isMetaTokenExpiredError } from "@/lib/social/meta";
import { getTikTokUserInfo } from "@/lib/social/tiktok";
import { getWhatsAppPhoneNumberInfo } from "@/lib/social/whatsapp";
import type { SocialPlatform, SocialTriggerType } from "@/lib/types/social";

export async function createSocialPostAction(tenantId: string, tenantSlug: string, formData: FormData): Promise<{ error?: string }> {
  const accountId = String(formData.get("accountId") ?? "");
  const platform = formData.get("platform") as SocialPlatform;
  const content = String(formData.get("content") ?? "").trim();
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");

  if (!accountId || !platform) return { error: "Elige una cuenta conectada." };
  if (!content && !mediaUrl) return { error: "Escribe un texto o agrega contenido multimedia." };
  if (platform !== "tiktok" && !mediaUrl && !content) return { error: "Escribe un texto para la publicación." };

  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null;

  await createSocialPost(tenantId, {
    accountId,
    platform,
    content,
    mediaUrls: mediaUrl ? [mediaUrl] : [],
    scheduledAt,
    createdBy: "",
  });

  revalidatePath(`/${tenantSlug}/admin/redes-sociales/publicaciones`);
  return {};
}

export async function deleteSocialPostAction(tenantId: string, tenantSlug: string, postId: string): Promise<void> {
  await deleteSocialPost(tenantId, postId);
  revalidatePath(`/${tenantSlug}/admin/redes-sociales/publicaciones`);
}

/**
 * WhatsApp numbers connect by pasting credentials instead of OAuth (see
 * lib/social/whatsapp.ts's doc comment for why) — this validates them
 * against Graph API before saving so a typo doesn't sit silently broken.
 */
export async function connectWhatsAppAccountAction(tenantId: string, tenantSlug: string, formData: FormData): Promise<{ error?: string }> {
  const phoneNumberId = String(formData.get("phoneNumberId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  if (!phoneNumberId || !accessToken) return { error: "Completa el ID de número de teléfono y el token de acceso." };

  let info;
  try {
    info = await getWhatsAppPhoneNumberInfo(phoneNumberId, accessToken);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo validar el número con Meta." };
  }

  await upsertSocialAccount(tenantId, {
    platform: "whatsapp",
    externalAccountId: phoneNumberId,
    displayName: `${info.verifiedName} (${info.displayPhoneNumber})`,
    accessToken,
    refreshToken: null,
    tokenExpiresAt: null,
    scopes: [],
    connectedBy: "",
    status: "active",
  });

  revalidatePath(`/${tenantSlug}/admin/redes-sociales/cuentas`);
  return {};
}

export async function disconnectSocialAccountAction(tenantId: string, tenantSlug: string, accountId: string): Promise<void> {
  await deleteSocialAccount(tenantId, accountId);
  revalidatePath(`/${tenantSlug}/admin/redes-sociales/cuentas`);
}

export async function createAutoReplyRuleAction(tenantId: string, tenantSlug: string, formData: FormData): Promise<{ error?: string }> {
  const accountId = String(formData.get("accountId") ?? "");
  const platform = formData.get("platform") as SocialPlatform;
  const triggerType = formData.get("triggerType") as SocialTriggerType;
  const keywordsRaw = String(formData.get("keywords") ?? "").trim();
  const replyTemplate = String(formData.get("replyTemplate") ?? "").trim();

  if (!accountId || !platform || !triggerType) return { error: "Elige una cuenta conectada." };
  if (!replyTemplate) return { error: "Escribe el mensaje de respuesta automática." };
  if (platform === "tiktok") return { error: "TikTok no ofrece una API pública de comentarios/mensajes — esta regla no podrá activarse todavía." };

  const keywords = keywordsRaw
    ? keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  await createAutoReplyRule(tenantId, { accountId, platform, triggerType, keywords, replyTemplate, active: true });
  revalidatePath(`/${tenantSlug}/admin/redes-sociales/respuestas`);
  return {};
}

export async function toggleAutoReplyRuleAction(tenantId: string, tenantSlug: string, ruleId: string, active: boolean): Promise<void> {
  await setAutoReplyRuleActive(tenantId, ruleId, active);
  revalidatePath(`/${tenantSlug}/admin/redes-sociales/respuestas`);
}

export async function deleteAutoReplyRuleAction(tenantId: string, tenantSlug: string, ruleId: string): Promise<void> {
  await deleteAutoReplyRule(tenantId, ruleId);
  revalidatePath(`/${tenantSlug}/admin/redes-sociales/respuestas`);
}

/** Pulls current follower/engagement numbers straight from the platform and stores a new snapshot — "Sincronizar ahora" on /admin/redes-sociales/analiticas. */
export async function syncAccountMetricsAction(tenantId: string, tenantSlug: string, accountId: string): Promise<{ error?: string }> {
  const account = await getSocialAccountById(tenantId, accountId);
  if (!account) return { error: "Cuenta no encontrada." };

  try {
    if (account.platform === "meta_facebook") {
      const insights = await getFacebookPageInsights(account.externalAccountId, account.accessToken);
      await recordMetricsSnapshot(tenantId, {
        accountId,
        platform: account.platform,
        followersCount: insights.followersCount,
        engagementCount: insights.engagementCount,
        impressionsCount: insights.impressionsCount,
        raw: insights.raw,
      });
    } else if (account.platform === "meta_instagram") {
      const insights = await getInstagramInsights(account.externalAccountId, account.accessToken);
      await recordMetricsSnapshot(tenantId, {
        accountId,
        platform: account.platform,
        followersCount: insights.followersCount,
        engagementCount: insights.engagementCount,
        impressionsCount: insights.impressionsCount,
        raw: insights.raw,
      });
    } else if (account.platform === "tiktok") {
      const info = await getTikTokUserInfo(account.accessToken);
      await recordMetricsSnapshot(tenantId, {
        accountId,
        platform: account.platform,
        followersCount: info.followerCount,
        engagementCount: info.likesCount,
        impressionsCount: info.videoCount,
        raw: { ...info },
      });
    } else if (account.platform === "whatsapp") {
      // No follower/engagement/impressions concept for a phone number — quality_rating (Meta's own health signal for the number) is the only thing worth recording.
      const info = await getWhatsAppPhoneNumberInfo(account.externalAccountId, account.accessToken);
      await recordMetricsSnapshot(tenantId, {
        accountId,
        platform: account.platform,
        followersCount: null,
        engagementCount: null,
        impressionsCount: null,
        raw: { ...info },
      });
    }
  } catch (error) {
    if (isMetaTokenExpiredError(error)) {
      return { error: "El token de esta cuenta venció — reconéctala desde /admin/redes-sociales/cuentas." };
    }
    return { error: error instanceof Error ? error.message : "No se pudo sincronizar." };
  }

  revalidatePath(`/${tenantSlug}/admin/redes-sociales/analiticas`);
  return {};
}
