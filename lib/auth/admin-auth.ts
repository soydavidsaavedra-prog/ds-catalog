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
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  store.delete(IMPERSONATION_MARKER_COOKIE);
}

export async function isAdminAuthenticated(tenantSlug: string): Promise<boolean> {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookieValue) return false;
  return cookieValue === (await computeSessionToken(tenantSlug));
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
