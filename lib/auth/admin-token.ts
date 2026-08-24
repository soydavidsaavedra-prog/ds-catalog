/**
 * Pure session-token helpers with no Node/Edge-specific imports, so both
 * lib/auth/admin-auth.ts (Server Actions/Components, via next/headers) and
 * middleware.ts (Edge runtime, via NextRequest.cookies) can share the exact
 * same token logic instead of duplicating it.
 */

export const ADMIN_SESSION_COOKIE = "ns_admin_session";
const DEV_FALLBACK_PASSWORD = "elnuevosanchez2026";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? DEV_FALLBACK_PASSWORD;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? getAdminPassword();
  return sha256Hex(`ns-admin-session:${secret}`);
}

export function verifyPassword(password: string): boolean {
  return password === getAdminPassword();
}
