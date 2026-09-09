import { describe, expect, it } from "vitest";
import { base32Decode, hotp, generateTotp } from "@/e2e/setup/totp";

// RFC 4226 Appendix D's official test vectors — ASCII secret
// "12345678901234567890", HMAC-SHA1, 6-digit truncation of each 10-digit
// reference value. Verifying against these (not just eyeballing the
// algorithm) is the whole point: this generator stands in for a real
// authenticator app in e2e/super-admin-2fa.spec.ts, so a subtly wrong
// implementation would make that test either always fail or, worse,
// silently pass against a byte-for-byte-matching bug on both sides.
const RFC4226_SECRET = Buffer.from("12345678901234567890", "ascii");
const RFC4226_HOTP_VECTORS = ["755224", "287082", "359152", "969429", "338314", "254676", "287922", "162583", "399871", "520489"];

describe("hotp", () => {
  it("matches every RFC 4226 Appendix D test vector", () => {
    RFC4226_HOTP_VECTORS.forEach((expected, counter) => {
      expect(hotp(RFC4226_SECRET, counter)).toBe(expected);
    });
  });
});

describe("base32Decode", () => {
  it("round-trips known base32 encodings back to their original bytes", () => {
    // "12345678901234567890" (ASCII) is GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ in base32.
    expect(base32Decode("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ")).toEqual(RFC4226_SECRET);
  });

  it("is case-insensitive and ignores padding", () => {
    expect(base32Decode("gezdgnbvgy3tqojq====")).toEqual(base32Decode("GEZDGNBVGY3TQOJQ"));
  });
});

describe("generateTotp", () => {
  it("produces the same HOTP code hotp() would for the current time-derived counter", () => {
    const counter = Math.floor(Date.now() / 1000 / 30);
    expect(generateTotp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ")).toBe(hotp(RFC4226_SECRET, counter));
  });

  it("returns 6 digits, zero-padded", () => {
    expect(generateTotp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ")).toMatch(/^\d{6}$/);
  });
});
