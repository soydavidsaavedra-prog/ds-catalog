/**
 * Pure session-token helpers for the Super Admin role, with no Node/Edge-
 * specific imports — mirrors lib/auth/admin-token.ts's split so both
 * lib/auth/superadmin-auth.ts (Server Actions/Components) and
 * middleware.ts (Edge runtime) share the exact same token logic.
 *
 * Unlike tenant admin sessions (whose cookie is scoped by a slug that's
 * already public, right there in the URL), a superadmin session has to
 * identify WHICH super_admin_users row it belongs to — there's no URL
 * segment to derive that from. So the cookie carries both: the account id
 * in the clear, plus a signature over that id, in the form
 * "<userId>.<signatureHex>". Middleware recomputes the signature for the
 * claimed userId and compares — it never has to query the database. The
 * signature alone (not the userId) is the actual secret-derived proof;
 * forging a valid one for an arbitrary userId requires SUPERADMIN_SESSION_SECRET.
 */

export const SUPERADMIN_SESSION_COOKIE = "ds_superadmin_session";

function getSuperadminSessionSecret(): string {
  const secret = process.env.SUPERADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing SUPERADMIN_SESSION_SECRET. Set it in your environment before using /superadmin — there is no insecure fallback for this one, unlike ADMIN_PASSWORD.",
    );
  }
  return secret;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function computeSignature(userId: string): Promise<string> {
  const secret = getSuperadminSessionSecret();
  return sha256Hex(`ds-superadmin-session:${userId}:${secret}`);
}

export async function computeSuperadminSessionCookie(userId: string): Promise<string> {
  return `${userId}.${await computeSignature(userId)}`;
}

/** Returns the authenticated userId if `cookieValue` is a validly-signed session, else null. */
export async function verifySuperadminSessionCookie(cookieValue: string | undefined): Promise<string | null> {
  if (!cookieValue) return null;
  const [userId, signature] = cookieValue.split(".");
  if (!userId || !signature) return null;
  const expected = await computeSignature(userId);
  return signature === expected ? userId : null;
}
