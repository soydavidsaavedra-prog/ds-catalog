import "server-only";

/**
 * Thin wrapper over TikTok for Developers (Login Kit + Content Posting
 * API + basic user stats). Same "optional, configured: false" pattern as
 * lib/domains/vercel-domains.ts and lib/social/meta.ts.
 *
 * IMPORTANT, read before wiring this up for real posting: TikTok grants
 * `video.publish` to a new app in "unaudited" mode with real limits —
 * videos land in the creator's TikTok inbox as a **draft** they must
 * finish and post by hand from the app, not a fully automatic public
 * post, until TikTok audits the app for direct posting. There is also no
 * general-purpose "reply to comments/DMs" endpoint in the public API —
 * that lives behind TikTok's separate, invite-only Business/Research
 * API tiers. This module intentionally does not pretend otherwise:
 * publishing and analytics are real; comment/DM auto-reply for TikTok is
 * not implemented (see lib/social/auto-reply.ts).
 */

const AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize/";
const API_BASE = "https://open.tiktokapis.com/v2";

const SCOPES = ["user.info.basic", "user.info.stats", "video.publish", "video.list"].join(",");

export function isTikTokConfigured(): boolean {
  return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
}

export function buildTikTokAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
    response_type: "code",
  });
  return `${AUTH_BASE}?${params.toString()}`;
}

export class TikTokApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "TikTokApiError";
    this.code = code;
  }
}

async function apiFetch<T>(path: string, init: RequestInit, accessToken?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
  const body = (await res.json().catch(() => ({}))) as { error?: { code: string; message: string } } & T;
  if (!res.ok || (body.error && body.error.code !== "ok")) {
    throw new TikTokApiError(body.error?.message ?? `TikTok respondió ${res.status}.`, body.error?.code);
  }
  return body;
}

export interface TikTokTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  openId: string;
}

export async function exchangeTikTokCode(code: string, redirectUri: string): Promise<TikTokTokenResult> {
  const res = await fetch(`${API_BASE}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    open_id?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !body.access_token) {
    throw new TikTokApiError(body.error_description ?? body.error ?? `TikTok respondió ${res.status}.`);
  }
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? "",
    expiresInSeconds: body.expires_in ?? 0,
    openId: body.open_id ?? "",
  };
}

/** Access tokens last ~24h; refresh tokens last ~1 year. Call this proactively (e.g. before publishing) once token_expires_at is close. */
export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResult> {
  const res = await fetch(`${API_BASE}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    open_id?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !body.access_token) {
    throw new TikTokApiError(body.error_description ?? body.error ?? `TikTok respondió ${res.status}.`);
  }
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? refreshToken,
    expiresInSeconds: body.expires_in ?? 0,
    openId: body.open_id ?? "",
  };
}

export interface TikTokUserInfo {
  openId: string;
  displayName: string;
  followerCount: number | null;
  likesCount: number | null;
  videoCount: number | null;
}

export async function getTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const data = await apiFetch<{
    data: { user: { open_id: string; display_name: string; follower_count?: number; likes_count?: number; video_count?: number } };
  }>("/user/info/?fields=open_id,display_name,follower_count,likes_count,video_count", { method: "GET" }, accessToken);

  const user = data.data.user;
  return {
    openId: user.open_id,
    displayName: user.display_name,
    followerCount: user.follower_count ?? null,
    likesCount: user.likes_count ?? null,
    videoCount: user.video_count ?? null,
  };
}

/**
 * Content Posting API — PULL_FROM_URL source, so `videoUrl` must already
 * be a public, reachable URL (TikTok's servers fetch it directly). On an
 * unaudited app this delivers to the creator's TikTok inbox as a draft
 * (see the module doc comment above), not a published video — the
 * `publish_id` returned here is a job id you'd poll via
 * /post/publish/status/fetch/ to know when TikTok finished pulling it in.
 */
export async function publishTikTokVideo(accessToken: string, caption: string, videoUrl: string): Promise<{ externalPostId: string }> {
  const data = await apiFetch<{ data: { publish_id: string } }>(
    "/post/publish/content/init/",
    {
      method: "POST",
      body: JSON.stringify({
        post_info: { title: caption, privacy_level: "SELF_ONLY", disable_comment: false },
        source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
      }),
    },
    accessToken,
  );
  return { externalPostId: data.data.publish_id };
}
