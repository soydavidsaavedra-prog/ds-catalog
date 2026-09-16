/**
 * Signs/verifies the `state` param round-tripped through Meta/TikTok's
 * OAuth dialog. Both providers echo `state` back verbatim on the
 * callback, but neither authenticates it — without a signature, anyone
 * could craft a callback URL with `state=<victim-tenant-slug>` and get a
 * connected account written onto a tenant they don't own. Same HMAC
 * approach as lib/auth/admin-token.ts (Edge/Node-portable via
 * crypto.subtle), scoped to this one round-trip instead of a session.
 */

export interface SocialOAuthState {
  tenantSlug: string;
  platform: string;
  /** Where to send the admin back to after the callback finishes. */
  returnTo: string;
  /** Epoch ms — states older than 10 minutes are rejected (the OAuth dialog took too long, or this is a replayed URL). */
  issuedAt: number;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function stateSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "ds-catalog-social-oauth-dev-secret";
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(stateSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function signOAuthState(state: SocialOAuthState): Promise<string> {
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(state)));
  const signature = await hmacSign(payload);
  return `${payload}.${signature}`;
}

/** Returns null for a missing, malformed, forged, or expired state — the caller should treat all of those the same (reject the callback). */
export async function verifyOAuthState(token: string): Promise<SocialOAuthState | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await hmacSign(payload);
  if (expected !== signature) return null;

  try {
    const state = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as SocialOAuthState;
    if (Date.now() - state.issuedAt > 10 * 60 * 1000) return null;
    return state;
  } catch {
    return null;
  }
}
