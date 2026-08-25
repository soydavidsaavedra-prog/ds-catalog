import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Per-tenant admin password hashing, used only by app/registro's
 * registration action and by loginAction (both Server Actions, Node
 * runtime). Deliberately kept out of lib/auth/admin-token.ts, which is
 * shared with middleware.ts running on the Edge runtime and cannot use
 * node:crypto.
 *
 * Stored format is "<saltHex>:<hashHex>" in ds_tenants.admin_password_hash
 * — scrypt with a random salt per tenant, no external dependency needed.
 */

const KEY_LENGTH = 64;

export function hashTenantPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyTenantPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
