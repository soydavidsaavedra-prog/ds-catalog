/**
 * Pure session-token helpers with no Node/Edge-specific imports, so both
 * lib/auth/admin-auth.ts (Server Actions/Components, via next/headers) and
 * middleware.ts (Edge runtime, via NextRequest.cookies) can share the exact
 * same token logic instead of duplicating it.
 *
 * Sessions are scoped per tenant: the same shared ADMIN_PASSWORD (env
 * var — see the note below) still gates login, but the resulting session
 * token is derived from the tenant's slug too, so a cookie proving you're
 * logged into /elnuevosanchez/admin does not authenticate you for
 * /demo/admin — you'd need to log in there separately. This does not
 * require a DB call (the tenant slug comes straight from the URL), so it
 * stays cheap enough to run in Edge middleware on every admin request.
 *
 * Real per-tenant credentials (a distinct password per tenant, instead of
 * one shared password whose *session* is merely tenant-scoped) are the
 * natural next step — see ds_tenants.admin_password_hash in
 * supabase/schema.sql, added as the extension point but not wired in yet.
 */

export const ADMIN_SESSION_COOKIE = "ds_admin_session";
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

export async function computeSessionToken(tenantSlug: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? getAdminPassword();
  return sha256Hex(`ds-admin-session:${tenantSlug}:${secret}`);
}

export function verifyPassword(password: string): boolean {
  return password === getAdminPassword();
}
