import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";

/**
 * Brute-force protection for /acceder (app/acceder/actions.ts) — the one
 * login form for both tenant owners and Super Admin. Every FAILED attempt
 * is recorded in ds_login_attempts (see supabase/schema.sql's "login rate
 * limiting" section); a successful login clears that email's own rows.
 * No `success` column on that table: only failures are ever inserted, so
 * counting rows in a time window IS the failure count.
 *
 * Two independent limits:
 *  - per email: stops brute-forcing one known/guessed account (the
 *    scenario that matters most for the one Super Admin email).
 *  - per IP, across every email it tried: stops a single source spraying
 *    many different accounts, which a per-email-only limit wouldn't catch
 *    since no single email would individually cross its own threshold.
 * A request that fails both checks reports whichever lockout is longer.
 */

const EMAIL_MAX_ATTEMPTS = 5;
const EMAIL_WINDOW_MINUTES = 15;

const IP_MAX_ATTEMPTS = 20;
const IP_WINDOW_MINUTES = 15;

export interface RateLimitResult {
  blocked: boolean;
  /** Rounded up to the nearest whole minute — only set when blocked. */
  retryAfterMinutes?: number;
}

async function oldestAttemptWithinWindow(
  column: "identifier" | "ip",
  value: string,
  windowStart: Date,
): Promise<Date | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_login_attempts")
    .select("created_at")
    .eq(column, value)
    .gte("created_at", windowStart.toISOString())
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? new Date(data.created_at) : null;
}

async function countAttemptsWithinWindow(
  column: "identifier" | "ip",
  value: string,
  windowStart: Date,
): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from("ds_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq(column, value)
    .gte("created_at", windowStart.toISOString());
  if (error) throw error;
  return count ?? 0;
}

function minutesUntilExpiry(oldestAttempt: Date, windowMinutes: number): number {
  const expiresAt = oldestAttempt.getTime() + windowMinutes * 60 * 1000;
  return Math.max(1, Math.ceil((expiresAt - Date.now()) / (60 * 1000)));
}

/** Checked BEFORE attempting Supabase Auth verification — a blocked request never spends a real auth call. */
export async function checkLoginRateLimit(identifier: string, ip: string | null): Promise<RateLimitResult> {
  const now = Date.now();
  const emailWindowStart = new Date(now - EMAIL_WINDOW_MINUTES * 60 * 1000);
  const emailCount = await countAttemptsWithinWindow("identifier", identifier, emailWindowStart);

  let retryAfterMinutes = 0;

  if (emailCount >= EMAIL_MAX_ATTEMPTS) {
    const oldest = await oldestAttemptWithinWindow("identifier", identifier, emailWindowStart);
    if (oldest) retryAfterMinutes = Math.max(retryAfterMinutes, minutesUntilExpiry(oldest, EMAIL_WINDOW_MINUTES));
  }

  if (ip) {
    const ipWindowStart = new Date(now - IP_WINDOW_MINUTES * 60 * 1000);
    const ipCount = await countAttemptsWithinWindow("ip", ip, ipWindowStart);
    if (ipCount >= IP_MAX_ATTEMPTS) {
      const oldest = await oldestAttemptWithinWindow("ip", ip, ipWindowStart);
      if (oldest) retryAfterMinutes = Math.max(retryAfterMinutes, minutesUntilExpiry(oldest, IP_WINDOW_MINUTES));
    }
  }

  return retryAfterMinutes > 0 ? { blocked: true, retryAfterMinutes } : { blocked: false };
}

/** Also opportunistically prunes this email's own rows older than the longer of the two windows, so the table doesn't grow unbounded — no cron job needed for a login form's own volume. */
export async function recordFailedLoginAttempt(identifier: string, ip: string | null): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_login_attempts").insert({ identifier, ip });
  if (error) throw error;

  const pruneBefore = new Date(Date.now() - Math.max(EMAIL_WINDOW_MINUTES, IP_WINDOW_MINUTES) * 60 * 1000);
  await supabase.from("ds_login_attempts").delete().eq("identifier", identifier).lt("created_at", pruneBefore.toISOString());
}

/** Called on a successful login so a few earlier mistyped attempts don't leave the account half-locked right after finally getting in. */
export async function clearFailedLoginAttempts(identifier: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_login_attempts").delete().eq("identifier", identifier);
  if (error) throw error;
}

/**
 * Best-effort client IP from the headers Vercel/most proxies set — never
 * throws, returns null if neither is present (e.g. local dev without a
 * proxy in front). x-forwarded-for can be a comma-separated chain
 * ("client, proxy1, proxy2"); the first entry is the original client.
 */
export function extractClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headers.get("x-real-ip");
}
