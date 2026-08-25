import "server-only";
import { hashPassword, verifyHashedPassword } from "@/lib/auth/password-hash";

/**
 * Per-tenant admin password hashing, used only by app/registro's
 * registration action and by loginAction (both Server Actions, Node
 * runtime). Deliberately kept out of lib/auth/admin-token.ts, which is
 * shared with middleware.ts running on the Edge runtime and cannot use
 * node:crypto.
 *
 * Thin, tenant-named wrapper over the generic lib/auth/password-hash.ts
 * (shared with super_admin_users) so existing call sites don't change.
 */

export function hashTenantPassword(password: string): string {
  return hashPassword(password);
}

export function verifyTenantPassword(password: string, storedHash: string): boolean {
  return verifyHashedPassword(password, storedHash);
}
