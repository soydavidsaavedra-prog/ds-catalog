import "server-only";

/**
 * Thin wrapper over Meta's Graph API (Facebook Pages + Instagram
 * Business/Creator accounts share one Graph API and one App). Same
 * "optional, configured: false" pattern as lib/domains/vercel-domains.ts:
 * without META_APP_ID/META_APP_SECRET this whole module is inert instead
 * of throwing, so the app runs fine for tenants who never touch social
 * automation.
 *
 * IMPORTANT — this is real API surface, not a mock, but production use
 * needs a Meta App in Live mode: `pages_manage_posts`,
 * `instagram_content_publish`, `pages_messaging` and
 * `pages_manage_engagement` are all restricted permissions that Meta's
 * App Review must approve (or you're limited to accounts with an admin
 * role on the App, in Development mode). Facebook/Instagram access
 * tokens obtained here are long-lived (~60 days) but do expire — there is
 * no silent refresh token like TikTok's; the tenant has to reconnect from
 * /admin/redes-sociales/cuentas when `ds_social_accounts.status` flips to
 * "expired" (set by the publish/sync paths below on a 190 error code).
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";
const AUTH_DIALOG_BASE = "https://www.facebook.com/v21.0/dialog/oauth";

const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_manage_engagement",
  "pages_messaging",
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_comments",
  "business_management",
].join(",");

export function isMetaConfigured(): boolean {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export function buildMetaAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID ?? "",
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
    response_type: "code",
  });
  return `${AUTH_DIALOG_BASE}?${params.toString()}`;
}

interface GraphError {
  error?: { message: string; type: string; code: number; error_subcode?: number };
}

async function graphFetch<T>(path: string, params: Record<string, string> = {}, init?: RequestInit): Promise<T> {
  const url = new URL(`${GRAPH_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, init);
  const body = (await res.json().catch(() => ({}))) as T & GraphError;
  if (!res.ok || body.error) {
    throw new MetaApiError(body.error?.message ?? `Meta respondió ${res.status}.`, body.error?.code);
  }
  return body;
}

export class MetaApiError extends Error {
  /** Graph API error code 190 = the access token expired or was revoked — see markExpiredOnAuthError below. */
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = "MetaApiError";
    this.code = code;
  }
}

export function isMetaTokenExpiredError(error: unknown): boolean {
  return error instanceof MetaApiError && error.code === 190;
}

/** Step 1 of the OAuth exchange: the dialog's `code` for a short-lived user access token. */
export async function exchangeMetaCode(code: string, redirectUri: string): Promise<{ accessToken: string }> {
  const data = await graphFetch<{ access_token: string }>("/oauth/access_token", {
    client_id: process.env.META_APP_ID ?? "",
    client_secret: process.env.META_APP_SECRET ?? "",
    redirect_uri: redirectUri,
    code,
  });
  return { accessToken: data.access_token };
}

/** Step 2: trade the short-lived token for a long-lived one (~60 days) — short-lived tokens expire in ~1-2h, useless for anything but this exchange. */
export async function getLongLivedUserToken(shortLivedToken: string): Promise<{ accessToken: string; expiresInSeconds: number | null }> {
  const data = await graphFetch<{ access_token: string; expires_in?: number }>("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID ?? "",
    client_secret: process.env.META_APP_SECRET ?? "",
    fb_exchange_token: shortLivedToken,
  });
  return { accessToken: data.access_token, expiresInSeconds: data.expires_in ?? null };
}

export interface MetaConnectablePage {
  pageId: string;
  pageName: string;
  /** Page access token — distinct from (and normally never expiring while the granting user token is valid for) the user token used to fetch it; this is what's actually stored per ds_social_accounts row. */
  pageAccessToken: string;
  instagramBusinessAccountId: string | null;
}

/** Every Facebook Page the connecting user administers, with each Page's own access token — the account picker shown after the OAuth callback lands. */
export async function listConnectablePages(userAccessToken: string): Promise<MetaConnectablePage[]> {
  const data = await graphFetch<{
    data: { id: string; name: string; access_token: string; instagram_business_account?: { id: string } }[];
  }>("/me/accounts", { access_token: userAccessToken, fields: "id,name,access_token,instagram_business_account" });

  return data.data.map((page) => ({
    pageId: page.id,
    pageName: page.name,
    pageAccessToken: page.access_token,
    instagramBusinessAccountId: page.instagram_business_account?.id ?? null,
  }));
}

/** Publishes to a Facebook Page's feed. Photo posts use /photos (single image); text-only and multi-image-less posts use /feed. */
export async function publishToFacebookPage(
  pageId: string,
  pageAccessToken: string,
  content: string,
  mediaUrls: string[],
): Promise<{ externalPostId: string }> {
  if (mediaUrls.length > 0) {
    const data = await graphFetch<{ post_id?: string; id: string }>(
      `/${pageId}/photos`,
      {},
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: mediaUrls[0], caption: content, access_token: pageAccessToken }),
      },
    );
    return { externalPostId: data.post_id ?? data.id };
  }

  const data = await graphFetch<{ id: string }>(
    `/${pageId}/feed`,
    {},
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content, access_token: pageAccessToken }),
    },
  );
  return { externalPostId: data.id };
}

/** Instagram publishing is always two calls: create a media container, then publish it — there's no single-step endpoint. Requires a public, already-hosted image URL (Instagram fetches it server-side; a data: URI or localhost path won't work). */
export async function publishToInstagram(
  igUserId: string,
  pageAccessToken: string,
  content: string,
  mediaUrls: string[],
): Promise<{ externalPostId: string }> {
  if (mediaUrls.length === 0) {
    throw new Error("Instagram requiere al menos una imagen — no se pueden publicar posts de solo texto.");
  }

  const container = await graphFetch<{ id: string }>(
    `/${igUserId}/media`,
    {},
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: mediaUrls[0], caption: content, access_token: pageAccessToken }),
    },
  );

  const published = await graphFetch<{ id: string }>(
    `/${igUserId}/media_publish`,
    {},
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: container.id, access_token: pageAccessToken }),
    },
  );
  return { externalPostId: published.id };
}

export async function replyToFacebookComment(commentId: string, pageAccessToken: string, message: string): Promise<void> {
  await graphFetch(
    `/${commentId}/comments`,
    {},
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: pageAccessToken }),
    },
  );
}

export async function replyToInstagramComment(commentId: string, pageAccessToken: string, message: string): Promise<void> {
  await graphFetch(
    `/${commentId}/replies`,
    {},
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: pageAccessToken }),
    },
  );
}

/** Page Messenger DM reply — needs `pages_messaging` and, for anyone outside the Page's own team, App Review in Live mode. */
export async function sendFacebookDirectMessage(pageId: string, pageAccessToken: string, recipientId: string, message: string): Promise<void> {
  await graphFetch(
    `/${pageId}/messages`,
    {},
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: "RESPONSE",
        access_token: pageAccessToken,
      }),
    },
  );
}

export interface MetaInsights {
  followersCount: number | null;
  engagementCount: number | null;
  impressionsCount: number | null;
  raw: Record<string, unknown>;
}

export async function getFacebookPageInsights(pageId: string, pageAccessToken: string): Promise<MetaInsights> {
  const data = await graphFetch<{ fan_count?: number; talking_about_count?: number }>(`/${pageId}`, {
    fields: "fan_count,talking_about_count",
    access_token: pageAccessToken,
  });
  return {
    followersCount: data.fan_count ?? null,
    engagementCount: data.talking_about_count ?? null,
    impressionsCount: null,
    raw: data,
  };
}

export async function getInstagramInsights(igUserId: string, pageAccessToken: string): Promise<MetaInsights> {
  const profile = await graphFetch<{ followers_count?: number }>(`/${igUserId}`, {
    fields: "followers_count",
    access_token: pageAccessToken,
  });

  // reach/impressions need the account to have at least a few days of history — this call is best-effort.
  let impressionsCount: number | null = null;
  try {
    const insights = await graphFetch<{ data: { name: string; values: { value: number }[] }[] }>(`/${igUserId}/insights`, {
      metric: "reach",
      period: "day",
      access_token: pageAccessToken,
    });
    impressionsCount = insights.data[0]?.values?.[0]?.value ?? null;
  } catch {
    impressionsCount = null;
  }

  return {
    followersCount: profile.followers_count ?? null,
    engagementCount: null,
    impressionsCount,
    raw: { ...profile, impressionsCount },
  };
}

/** Verifies Meta's webhook subscription handshake (GET with hub.challenge) — see app/api/social/webhooks/meta/route.ts. */
export function verifyMetaWebhookChallenge(mode: string | null, token: string | null): boolean {
  return mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN;
}

/** Verifies the X-Hub-Signature-256 header Meta signs every webhook POST body with, using the App Secret — without this, anyone who finds the webhook URL could post fake comments/DMs that trigger auto-replies. */
export async function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256=${expected}` === signatureHeader;
}
