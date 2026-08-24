import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, computeSessionToken } from "@/lib/auth/admin-token";

export { ADMIN_SESSION_COOKIE, getAdminPassword, verifyPassword } from "@/lib/auth/admin-token";

/**
 * Single shared-password, tenant-scoped session auth. No external auth
 * provider, no per-tenant user accounts yet — this is intentionally the
 * simplest thing that actually protects /[tenant]/admin while keeping
 * tenants' admin sessions from bleeding into each other: one password
 * (env-configured, shared across tenants for now), one signed cookie
 * whose value is derived from the tenant slug, checked both here and in
 * middleware.ts. See docs/ARCHITECTURE.md for the rationale and the
 * upgrade path (real per-tenant credentials, Super Admin vs Tenant Admin).
 *
 * IMPORTANT: set ADMIN_PASSWORD (and ideally ADMIN_SESSION_SECRET) in your
 * environment before deploying. The fallback in admin-token.ts exists only
 * so the demo runs locally out of the box — it is not safe for production.
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
}

export async function isAdminAuthenticated(tenantSlug: string): Promise<boolean> {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookieValue) return false;
  return cookieValue === (await computeSessionToken(tenantSlug));
}
