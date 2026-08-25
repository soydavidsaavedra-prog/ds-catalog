import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, computeSessionToken, verifyPassword } from "@/lib/auth/admin-token";
import { verifyTenantPassword } from "@/lib/auth/tenant-credentials";
import { getTenantAuthRecord } from "@/lib/repositories/tenant-repository";

export { ADMIN_SESSION_COOKIE, getAdminPassword, verifyPassword } from "@/lib/auth/admin-token";

/**
 * Tenant-scoped session auth. The session cookie mechanism is unchanged
 * (one signed cookie whose value is derived from the tenant slug, checked
 * both here and in middleware.ts — see docs/ARCHITECTURE.md), but what
 * counts as a correct password no longer has to be the single shared
 * ADMIN_PASSWORD: a tenant created via self-service registration
 * (app/registro) has its own admin_password_hash on ds_tenants (see
 * lib/auth/tenant-credentials.ts), checked first. Tenants without one set
 * — anything seeded before registration existed — keep authenticating
 * against the shared ADMIN_PASSWORD env var exactly as before, so nothing
 * breaks for elnuevosanchez/demo.
 *
 * IMPORTANT: set ADMIN_PASSWORD (and ideally ADMIN_SESSION_SECRET) in your
 * environment before deploying. The fallback in admin-token.ts exists only
 * so the demo runs locally out of the box — it is not safe for production.
 */

export async function verifyTenantAdminPassword(tenantSlug: string, password: string): Promise<boolean> {
  const record = await getTenantAuthRecord(tenantSlug);
  if (record?.adminPasswordHash) {
    return verifyTenantPassword(password, record.adminPasswordHash);
  }
  return verifyPassword(password);
}

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
