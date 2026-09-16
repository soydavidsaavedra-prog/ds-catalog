export type SocialPlatform = "meta_facebook" | "meta_instagram" | "tiktok" | "whatsapp";
export type SocialAccountStatus = "active" | "expired" | "revoked";
export type SocialPostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";
export type SocialTriggerType = "comment" | "dm";

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  meta_facebook: "Facebook",
  meta_instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

/** WhatsApp has no feed/posts — only messaging. Platforms in this set never appear in the post composer's account picker. */
export const SOCIAL_PLATFORMS_WITHOUT_POSTS: ReadonlySet<SocialPlatform> = new Set(["whatsapp"]);

export interface SocialAccount {
  id: string;
  tenantId: string;
  platform: SocialPlatform;
  externalAccountId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  scopes: string[];
  connectedBy: string;
  status: SocialAccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SocialPost {
  id: string;
  tenantId: string;
  accountId: string;
  platform: SocialPlatform;
  content: string;
  mediaUrls: string[];
  status: SocialPostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  externalPostId: string | null;
  errorMessage: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAutoReplyRule {
  id: string;
  tenantId: string;
  accountId: string;
  platform: SocialPlatform;
  triggerType: SocialTriggerType;
  keywords: string[];
  replyTemplate: string;
  active: boolean;
  createdAt: string;
}

export interface SocialEvent {
  id: string;
  tenantId: string;
  accountId: string;
  platform: SocialPlatform;
  eventType: SocialTriggerType;
  externalEventId: string;
  senderName: string;
  messageText: string;
  matchedRuleId: string | null;
  replied: boolean;
  replyText: string | null;
  replyError: string | null;
  createdAt: string;
}

export interface SocialMetricsSnapshot {
  id: string;
  tenantId: string;
  accountId: string;
  platform: SocialPlatform;
  capturedAt: string;
  followersCount: number | null;
  engagementCount: number | null;
  impressionsCount: number | null;
  raw: Record<string, unknown> | null;
}
