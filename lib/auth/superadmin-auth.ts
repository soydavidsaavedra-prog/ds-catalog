import "server-only";
import { cookies } from "next/headers";
import {
  SUPERADMIN_SESSION_COOKIE,
  computeSuperadminSessionCookie,
  verifySuperadminSessionCookie,
} from "@/lib/auth/superadmin-token";
import { verifyHashedPassword } from "@/lib/auth/password-hash";
import { getSuperAdminAuthRecordByEmail, type SuperAdminUser } from "@/lib/repositories/superadmin-users-repository";
import { getAppUserById } from "@/lib/repositories/app-users-repository";

export { SUPERADMIN_SESSION_COOKIE };

/**
 * Super Admin session auth — entirely separate from lib/auth/admin-auth.ts
 * (tenant admin). Different cookie name, different secret
 * (SUPERADMIN_SESSION_SECRET). The cookie itself still just carries an id +
 * signature (see superadmin-token.ts) but that id now identifies a row in
 * ds_app_users (role "superadmin"), not super_admin_users — real login
 * goes through Supabase Auth via the unified /acceder (see
 * app/acceder/actions.ts). super_admin_users / verifySuperadminCredentials
 * below survive only as the one-time auto-migration path for whoever's
 * account was created before this change: the first time they log in with
 * their existing email+password, accederAction provisions a matching
 * Supabase Auth user + ds_app_users row behind the scenes and every login
 * after that goes through Supabase Auth directly, never touching this
 * table again.
 */

export async function verifySuperadminCredentials(email: string, password: string): Promise<SuperAdminUser | null> {
  const record = await getSuperAdminAuthRecordByEmail(email);
  if (!record || !record.active) return null;
  if (!verifyHashedPassword(password, record.passwordHash)) return null;
  return { id: record.id, email: record.email, active: record.active };
}

export async function createSuperadminSession(userId: string): Promise<void> {
  const token = await computeSuperadminSessionCookie(userId);
  const store = await cookies();
  store.set(SUPERADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySuperadminSession(): Promise<void> {
  const store = await cookies();
  store.delete(SUPERADMIN_SESSION_COOKIE);
}

/** Returns the authenticated super admin, or null — re-checks ds_app_users on every call (unlike the cookie signature, which can't reflect a later role/deletion change). */
export async function getAuthenticatedSuperadmin(): Promise<SuperAdminUser | null> {
  const store = await cookies();
  const userId = await verifySuperadminSessionCookie(store.get(SUPERADMIN_SESSION_COOKIE)?.value);
  if (!userId) return null;
  const appUser = await getAppUserById(userId);
  if (!appUser || appUser.role !== "superadmin") return null;
  return { id: appUser.id, email: appUser.email, active: true };
}
