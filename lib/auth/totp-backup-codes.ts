import "server-only";
import { randomInt } from "node:crypto";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import { hashPassword, verifyHashedPassword } from "@/lib/auth/password-hash";

/**
 * One-time recovery codes for Super Admin's TOTP 2FA — see
 * supabase/schema.sql's "2FA backup codes" section for why these exist
 * at all: without them, losing the authenticator device before disabling
 * 2FA means losing the ability to log in, since 2FA itself gates the
 * page that would disable it.
 *
 * Hashed with the same scrypt helper as passwords (lib/auth/
 * password-hash.ts) — a backup code is just another secret string, no
 * reason to invent a second hashing scheme for it.
 */

const CODE_COUNT = 10;
// No 0/O/1/I/L — avoids characters that are easy to misread when a
// person is copying a code down by hand from the one-time reveal screen.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let raw = "";
  for (let i = 0; i < 10; i++) raw += ALPHABET[randomInt(ALPHABET.length)];
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Replaces this user's ENTIRE set with a fresh one — every previously issued code (used or not) stops working. Returns the new codes in plaintext; this is the only moment they ever exist outside their hashed form, so the caller must show them to the user now and never log or store them anywhere else. */
export async function generateBackupCodes(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  await deleteAllBackupCodes(userId);

  const codes = Array.from({ length: CODE_COUNT }, generateCode);
  const rows = codes.map((code) => ({ user_id: userId, code_hash: hashPassword(code) }));
  const { error } = await supabase.from("ds_totp_backup_codes").insert(rows);
  if (error) throw error;
  return codes;
}

export async function countUnusedBackupCodes(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from("ds_totp_backup_codes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("used_at", null);
  if (error) throw error;
  return count ?? 0;
}

/**
 * Checks `code` against every unused code on file for this user and, on a
 * match, marks that row used so it can never work again. Returns false
 * (never throws) for a wrong/already-used code — only a real infra error
 * throws, mirroring verifyEmailPassword's own convention.
 */
export async function consumeBackupCode(userId: string, code: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_totp_backup_codes")
    .select("id, code_hash")
    .eq("user_id", userId)
    .is("used_at", null);
  if (error) throw error;

  const normalized = normalizeCode(code);
  const match = (data ?? []).find((row) => verifyHashedPassword(normalized, row.code_hash));
  if (!match) return false;

  const { error: updateError } = await supabase
    .from("ds_totp_backup_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", match.id);
  if (updateError) throw updateError;
  return true;
}

/** Called when 2FA is disabled — leftover backup codes for a disabled factor would otherwise sit around, still individually valid to "recover into" 2FA that no longer exists. */
export async function deleteAllBackupCodes(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_totp_backup_codes").delete().eq("user_id", userId);
  if (error) throw error;
}
