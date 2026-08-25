import "server-only";
import { cookies } from "next/headers";
import {
  SUPERADMIN_SESSION_COOKIE,
  computeSuperadminSessionCookie,
  verifySuperadminSessionCookie,
} from "@/lib/auth/superadmin-token";
import { verifyHashedPassword } from "@/lib/auth/password-hash";
import { getSuperAdminAuthRecordByEmail, getSuperAdminById, type SuperAdminUser } from "@/lib/repositories/superadmin-users-repository";

export { SUPERADMIN_SESSION_COOKIE };

/**
 * Super Admin session auth — entirely separate from lib/auth/admin-auth.ts
 * (tenant admin). Different cookie name, different secret
 * (SUPERADMIN_SESSION_SECRET), different table (super_admin_users, real
 * per-person accounts with no self-registration). A tenant admin session
 * cookie is never valid here, and vice versa — see middleware.ts, which
 * checks each independently.
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

/** Returns the authenticated super admin, or null — re-checks the account is still active on every call (unlike the cookie signature, which can't reflect a later deactivation). */
export async function getAuthenticatedSuperadmin(): Promise<SuperAdminUser | null> {
  const store = await cookies();
  const userId = await verifySuperadminSessionCookie(store.get(SUPERADMIN_SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await getSuperAdminById(userId);
  return user?.active ? user : null;
}
