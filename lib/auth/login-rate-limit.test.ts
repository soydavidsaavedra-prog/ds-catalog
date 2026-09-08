import { afterEach, describe, expect, it, vi } from "vitest";
import { extractClientIp } from "@/lib/auth/login-rate-limit";

describe("extractClientIp", () => {
  it("takes the first entry of a comma-separated x-forwarded-for chain", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1, 10.0.0.2" });
    expect(extractClientIp(headers)).toBe("203.0.113.5");
  });

  it("trims whitespace around the first entry", () => {
    const headers = new Headers({ "x-forwarded-for": "  203.0.113.5  , 10.0.0.1" });
    expect(extractClientIp(headers)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.7" });
    expect(extractClientIp(headers)).toBe("198.51.100.7");
  });

  it("returns null when neither header is present", () => {
    expect(extractClientIp(new Headers())).toBeNull();
  });
});

interface FakeRow {
  identifier: string;
  ip: string | null;
  created_at: string;
}

const { rows, getSupabaseClient } = vi.hoisted(() => {
  const rows: FakeRow[] = [];

  function matches(row: FakeRow, col: string | undefined, val: string | undefined, gte: string | undefined): boolean {
    if (col && (row as unknown as Record<string, unknown>)[col] !== val) return false;
    if (gte && row.created_at < gte) return false;
    return true;
  }

  function makeSelectBuilder(opts?: { head?: boolean }) {
    let eqCol: string | undefined;
    let eqVal: string | undefined;
    let gte: string | undefined;
    const builder = {
      eq(col: string, val: string) {
        eqCol = col;
        eqVal = val;
        return builder;
      },
      gte(_col: string, val: string) {
        gte = val;
        return builder;
      },
      order() {
        return builder;
      },
      limit() {
        return builder;
      },
      maybeSingle() {
        return Promise.resolve(builder.result());
      },
      result() {
        const matched = rows.filter((r) => matches(r, eqCol, eqVal, gte));
        if (opts?.head) return { count: matched.length, error: null };
        const sorted = [...matched].sort((a, b) => a.created_at.localeCompare(b.created_at));
        return { data: sorted[0] ?? null, error: null };
      },
      then(resolve: (v: unknown) => void) {
        resolve(builder.result());
      },
    };
    return builder;
  }

  function makeDeleteBuilder() {
    let eqCol: string | undefined;
    let eqVal: string | undefined;
    const builder = {
      eq(col: string, val: string) {
        eqCol = col;
        eqVal = val;
        return builder;
      },
      lt(_col: string, val: string) {
        for (let i = rows.length - 1; i >= 0; i--) {
          if (matches(rows[i]!, eqCol, eqVal, undefined) && rows[i]!.created_at < val) rows.splice(i, 1);
        }
        return Promise.resolve({ error: null });
      },
      then(resolve: (v: unknown) => void) {
        for (let i = rows.length - 1; i >= 0; i--) {
          if (matches(rows[i]!, eqCol, eqVal, undefined)) rows.splice(i, 1);
        }
        resolve({ error: null });
      },
    };
    return builder;
  }

  const supabaseStub = {
    from: () => ({
      insert: (row: { identifier: string; ip: string | null }) => {
        rows.push({ ...row, created_at: new Date().toISOString() });
        return Promise.resolve({ error: null });
      },
      select: (_cols: string, opts?: { count?: string; head?: boolean }) => makeSelectBuilder(opts),
      delete: () => makeDeleteBuilder(),
    }),
  };

  return { rows, getSupabaseClient: () => supabaseStub };
});

vi.mock("@/lib/db/supabaseClient", () => ({ getSupabaseClient }));

afterEach(() => {
  rows.length = 0;
});

describe("checkLoginRateLimit / recordFailedLoginAttempt / clearFailedLoginAttempts", () => {
  it("is not blocked before reaching the failure threshold", async () => {
    const { checkLoginRateLimit, recordFailedLoginAttempt } = await import("@/lib/auth/login-rate-limit");
    for (let i = 0; i < 4; i++) await recordFailedLoginAttempt("test@example.com", "1.1.1.1");
    expect((await checkLoginRateLimit("test@example.com", "1.1.1.1")).blocked).toBe(false);
  });

  it("blocks the email after 5 failures within the window", async () => {
    const { checkLoginRateLimit, recordFailedLoginAttempt } = await import("@/lib/auth/login-rate-limit");
    for (let i = 0; i < 5; i++) await recordFailedLoginAttempt("locked@example.com", "2.2.2.2");
    const result = await checkLoginRateLimit("locked@example.com", "2.2.2.2");
    expect(result.blocked).toBe(true);
    expect(result.retryAfterMinutes).toBeGreaterThan(0);
  });

  it("clearFailedLoginAttempts resets the count for that email", async () => {
    const { checkLoginRateLimit, recordFailedLoginAttempt, clearFailedLoginAttempts } = await import(
      "@/lib/auth/login-rate-limit"
    );
    for (let i = 0; i < 5; i++) await recordFailedLoginAttempt("reset@example.com", "3.3.3.3");
    await clearFailedLoginAttempts("reset@example.com");
    expect((await checkLoginRateLimit("reset@example.com", "3.3.3.3")).blocked).toBe(false);
  });

  it("blocks an IP that sprayed 20 different emails, even though no single email crossed its own threshold", async () => {
    const { checkLoginRateLimit, recordFailedLoginAttempt } = await import("@/lib/auth/login-rate-limit");
    for (let i = 0; i < 20; i++) await recordFailedLoginAttempt(`victim${i}@example.com`, "9.9.9.9");
    const result = await checkLoginRateLimit("victim0@example.com", "9.9.9.9");
    expect(result.blocked).toBe(true);
  });

  it("does not block one email just because a shared IP has other emails' failures under the per-IP threshold", async () => {
    const { checkLoginRateLimit, recordFailedLoginAttempt } = await import("@/lib/auth/login-rate-limit");
    for (let i = 0; i < 3; i++) await recordFailedLoginAttempt(`other${i}@example.com`, "5.5.5.5");
    expect((await checkLoginRateLimit("fresh@example.com", "5.5.5.5")).blocked).toBe(false);
  });
});
