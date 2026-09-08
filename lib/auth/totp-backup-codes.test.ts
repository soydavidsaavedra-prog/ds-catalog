import { afterEach, describe, expect, it, vi } from "vitest";

interface FakeRow {
  id: string;
  user_id: string;
  code_hash: string;
  used_at: string | null;
}

const { rows, getSupabaseClient } = vi.hoisted(() => {
  const rows: FakeRow[] = [];
  let nextId = 1;

  const supabaseStub = {
    from: () => ({
      insert: (newRows: { user_id: string; code_hash: string }[]) => {
        for (const r of newRows) rows.push({ id: String(nextId++), used_at: null, ...r });
        return Promise.resolve({ error: null });
      },
      select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
        let eqCol: string | undefined;
        let eqVal: string | undefined;
        let isNullCol: string | undefined;
        const builder = {
          eq(col: string, val: string) {
            eqCol = col;
            eqVal = val;
            return builder;
          },
          is(col: string) {
            isNullCol = col;
            return builder;
          },
          then(resolve: (v: unknown) => void) {
            const matched = rows.filter((r) => {
              if (eqCol && (r as unknown as Record<string, unknown>)[eqCol] !== eqVal) return false;
              if (isNullCol && (r as unknown as Record<string, unknown>)[isNullCol] !== null) return false;
              return true;
            });
            if (opts?.head) resolve({ count: matched.length, error: null });
            else resolve({ data: matched, error: null });
          },
        };
        return builder;
      },
      update: (patch: Partial<FakeRow>) => ({
        eq: (col: string, val: string) => {
          for (const r of rows) {
            if ((r as unknown as Record<string, unknown>)[col] === val) Object.assign(r, patch);
          }
          return Promise.resolve({ error: null });
        },
      }),
      delete: () => ({
        eq: (col: string, val: string) => {
          for (let i = rows.length - 1; i >= 0; i--) {
            if ((rows[i] as unknown as Record<string, unknown>)[col] === val) rows.splice(i, 1);
          }
          return Promise.resolve({ error: null });
        },
      }),
    }),
  };

  return { rows, getSupabaseClient: () => supabaseStub };
});

vi.mock("@/lib/db/supabaseClient", () => ({ getSupabaseClient }));

afterEach(() => {
  rows.length = 0;
});

describe("generateBackupCodes", () => {
  it("returns 10 codes shaped XXXXX-XXXXX with no ambiguous characters", async () => {
    const { generateBackupCodes } = await import("@/lib/auth/totp-backup-codes");
    const codes = await generateBackupCodes("user-1");
    expect(codes).toHaveLength(10);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/);
      expect(code).not.toMatch(/[0O1IL]/);
    }
  });

  it("invalidates every previously issued code for that user on regeneration", async () => {
    const { generateBackupCodes, consumeBackupCode } = await import("@/lib/auth/totp-backup-codes");
    const first = await generateBackupCodes("user-1");
    await generateBackupCodes("user-1");
    expect(await consumeBackupCode("user-1", first[0]!)).toBe(false);
  });

  it("does not affect another user's existing codes", async () => {
    const { generateBackupCodes, consumeBackupCode } = await import("@/lib/auth/totp-backup-codes");
    const userTwoCodes = await generateBackupCodes("user-2");
    await generateBackupCodes("user-1");
    expect(await consumeBackupCode("user-2", userTwoCodes[0]!)).toBe(true);
  });
});

describe("consumeBackupCode", () => {
  it("accepts a valid unused code exactly once", async () => {
    const { generateBackupCodes, consumeBackupCode } = await import("@/lib/auth/totp-backup-codes");
    const codes = await generateBackupCodes("user-1");
    expect(await consumeBackupCode("user-1", codes[0]!)).toBe(true);
    expect(await consumeBackupCode("user-1", codes[0]!)).toBe(false);
  });

  it("rejects a code that was never issued", async () => {
    const { generateBackupCodes, consumeBackupCode } = await import("@/lib/auth/totp-backup-codes");
    await generateBackupCodes("user-1");
    expect(await consumeBackupCode("user-1", "ZZZZZ-ZZZZZ")).toBe(false);
  });

  it("is case-insensitive and trims surrounding whitespace", async () => {
    const { generateBackupCodes, consumeBackupCode } = await import("@/lib/auth/totp-backup-codes");
    const codes = await generateBackupCodes("user-1");
    expect(await consumeBackupCode("user-1", `  ${codes[0]!.toLowerCase()}  `)).toBe(true);
  });

  it("does not let one user consume another user's code", async () => {
    const { generateBackupCodes, consumeBackupCode } = await import("@/lib/auth/totp-backup-codes");
    const userOneCodes = await generateBackupCodes("user-1");
    await generateBackupCodes("user-2");
    expect(await consumeBackupCode("user-2", userOneCodes[0]!)).toBe(false);
  });
});

describe("countUnusedBackupCodes", () => {
  it("reflects the full set right after generation and decreases as codes are consumed", async () => {
    const { generateBackupCodes, consumeBackupCode, countUnusedBackupCodes } = await import(
      "@/lib/auth/totp-backup-codes"
    );
    const codes = await generateBackupCodes("user-1");
    expect(await countUnusedBackupCodes("user-1")).toBe(10);
    await consumeBackupCode("user-1", codes[0]!);
    expect(await countUnusedBackupCodes("user-1")).toBe(9);
  });

  it("is zero for a user with no codes", async () => {
    const { countUnusedBackupCodes } = await import("@/lib/auth/totp-backup-codes");
    expect(await countUnusedBackupCodes("nobody")).toBe(0);
  });
});
