import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, computeSessionToken } from "@/lib/auth/admin-token";

export { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-token";

/**
 * Tenant-scoped session auth. The session cookie itself is unchanged: one
 * signed cookie whose value is derived from the tenant slug, checked both
 * here and in middleware.ts (see docs/ARCHITECTURE.md) — this file only
 * ever mints/verifies that cookie, it no longer decides whether a
 * password was correct. Real credential checking now happens once, in
 * app/acceder/actions.ts, against Supabase Auth (see
 * lib/auth/supabase-auth.ts) — by the time createAdminSession(tenantSlug)
 * is called, identity has already been proven.
 */

export async function createAdminSession(tenantSlug: string): Promise<void> {
  const token = await computeSessionToken(tenantSlug);
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  // A brand-new session always starts clean. Without this, a stale
  // IMPERSONATION_MARKER_COOKIE left over from an earlier impersonation
  // (see impersonateTenantAction) that never went through
  // endImpersonationAction would make an unrelated, perfectly normal login
  // look like it's still impersonating — showing NSAdminSidebar's "Volver a
  // Super Admin" exit, which a real tenant session should never have.
  // impersonateTenantAction calls markImpersonatedSession() immediately
  // after this, so real impersonation is unaffected.
  store.delete(IMPERSONATION_MARKER_COOKIE);
  // Routing hint only (see getActiveAdminTenantSlug below) — never checked
  // by isAdminAuthenticated itself, so it carries no auth weight of its own.
  store.set(LAST_TENANT_HINT_COOKIE, tenantSlug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  store.delete(IMPERSONATION_MARKER_COOKIE);
  store.delete(LAST_TENANT_HINT_COOKIE);
}

export async function isAdminAuthenticated(tenantSlug: string): Promise<boolean> {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookieValue) return false;
  return cookieValue === (await computeSessionToken(tenantSlug));
}

/**
 * ADMIN_SESSION_COOKIE's value is a one-way hash of the tenant slug (see
 * admin-token.ts) — there is no way to recover WHICH tenant a session
 * belongs to from the cookie alone, unlike Super Admin's own session
 * (a plain id + signature — see superadmin-auth.ts). That's fine everywhere
 * a route already knows its own tenant slug from the URL, but leaves
 * /acceder unable to tell "you're already logged in" apart from "log in"
 * on a context-free visit (a new tab to the bare domain, no ?tenant=
 * hint). LAST_TENANT_HINT_COOKIE closes that gap: purely a routing hint
 * set by createAdminSession, checked here against the real session so a
 * stale/tampered value just falls back to null (show the login form),
 * never a way to forge access to a tenant you didn't actually log into.
 */
export const LAST_TENANT_HINT_COOKIE = "ds_last_tenant_hint";

export async function getActiveAdminTenantSlug(): Promise<string | null> {
  const store = await cookies();
  const slug = store.get(LAST_TENANT_HINT_COOKIE)?.value;
  if (!slug) return null;
  return (await isAdminAuthenticated(slug)) ? slug : null;
}

/**
 * Separate cookie, set alongside (never instead of) a normal
 * ADMIN_SESSION_COOKIE by app/superadmin/actions.ts's impersonateTenantAction
 * — flags that the current tenant-admin session started from Super Admin,
 * purely for the UI (see app/[tenant]/admin/(shell)/layout.tsx and
 * NSAdminSidebar's "Volver a Super Admin" banner). It carries no auth
 * weight of its own: isAdminAuthenticated() never reads it, so a
 * tenant-admin setting it by hand gains nothing but a misleading banner.
 * destroyAdminSession() always clears it too, so a stale marker never
 * outlives the session it described.
 */
export const IMPERSONATION_MARKER_COOKIE = "ds_impersonation_marker";

export async function markImpersonatedSession(tenantSlug: string): Promise<void> {
  const store = await cookies();
  store.set(IMPERSONATION_MARKER_COOKIE, tenantSlug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function isImpersonatedSession(): Promise<boolean> {
  const store = await cookies();
  return store.has(IMPERSONATION_MARKER_COOKIE);
}
