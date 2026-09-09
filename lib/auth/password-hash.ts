import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Generic scrypt password hashing — no tenant/superadmin-specific logic.
 * Used only by lib/auth/superadmin-auth.ts's legacy super_admin_users
 * check now (real credentials live in Supabase Auth — see
 * lib/auth/supabase-auth.ts — this survives only as the one-time
 * auto-migration path for accounts created before that existed).
 * Node-only (node:crypto) — never import from a file middleware.ts touches.
 *
 * Stored format is "<saltHex>:<hashHex>" — scrypt with a random salt per
 * password, no external dependency needed.
 */

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyHashedPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
