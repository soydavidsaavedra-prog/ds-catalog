import { createHmac } from "node:crypto";

/**
 * A from-scratch RFC 4226 (HOTP) / RFC 6238 (TOTP) implementation — used
 * only by the E2E suite (e2e/super-admin-2fa.spec.ts) to compute a
 * currently-valid 6-digit code straight from the base32 secret
 * /superadmin/seguridad's enrollment step returns, so the whole 2FA
 * enroll → confirm → log out → log back in flow can run unattended
 * without an actual phone/authenticator app in the loop. Small enough
 * (and security-inert — this only ever runs against a disposable test
 * account) that it wasn't worth a dependency just for this.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, "").toUpperCase();
  let bits = "";
  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/** RFC 4226's dynamic truncation — the shared core of both HOTP and TOTP. `key` is the raw secret bytes (already base32-decoded), never a base32 string. */
export function hotp(key: Buffer, counter: number, digits = 6): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const binary =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);

  return (binary % 10 ** digits).toString().padStart(digits, "0");
}

/** TOTP proper: HOTP with a counter derived from the current time — 30s steps and 6 digits are Supabase Auth's own TOTP defaults (and every standard authenticator app's). */
export function generateTotp(base32Secret: string, timeStepSeconds = 30, digits = 6): string {
  const counter = Math.floor(Date.now() / 1000 / timeStepSeconds);
  return hotp(base32Decode(base32Secret), counter, digits);
}
