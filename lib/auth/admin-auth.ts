import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, computeSessionToken } from "@/lib/auth/admin-token";

export { ADMIN_SESSION_COOKIE, getAdminPassword, verifyPassword } from "@/lib/auth/admin-token";

/**
 * Single-admin session auth. No external auth provider, no user accounts —
 * this is intentionally the simplest thing that actually protects /admin:
 * one password (env-configured), one signed cookie checked both here and
 * in middleware.ts. See docs/ARCHITECTURE.md for the rationale and the
 * upgrade path.
 *
 * IMPORTANT: set ADMIN_PASSWORD (and ideally ADMIN_SESSION_SECRET) in your
 * environment before deploying. The fallback in admin-token.ts exists only
 * so the demo runs locally out of the box — it is not safe for production.
 */

export async function createAdminSession(): Promise<void> {
  const token = await computeSessionToken();
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

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookieValue) return false;
  return cookieValue === (await computeSessionToken());
}
