import "server-only";
import { createSupabaseAuthSessionClient, getSupabaseClient, getSupabaseAuthClient } from "@/lib/db/supabaseClient";

/**
 * Thin wrappers over Supabase Auth — this is where every call to
 * supabase-js's `auth` namespace lives, so the rest of the app never talks
 * to it directly. admin.* calls (create/update/delete a user) always use
 * the service_role client (getSupabaseClient) since the Admin API requires
 * it; sign-in/reset/token calls use the anon-keyed client
 * (getSupabaseAuthClient) — see that function's comment for why.
 */

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Creates a Supabase Auth user with the email already marked confirmed —
 * every account here is created by our own server code (registration,
 * or a Super Admin invite), never by Supabase's own signup flow, so
 * there's no separate person to "confirm" the email against. This mirrors
 * the pre-existing registro behavior of logging a new tenant in
 * immediately after signup, with no blocking email-verification step (see
 * docs/ANALISIS_HORIZON_REFERENCIA_SAAS.md section 1).
 */
export async function createAuthUser(email: string, password: string): Promise<AuthUser> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return { id: data.user.id, email: data.user.email ?? email };
}

/** Returns the matching Supabase Auth user, or null if the email/password pair is wrong (never throws for that case — only for a real infra error). */
export async function verifyEmailPassword(email: string, password: string): Promise<AuthUser | null> {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? email };
}

export async function setUserPassword(userId: string, password: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { password });
  if (error) throw error;
}

/** /admin/cuenta's "cambiar correo de inicio de sesión" — email_confirm: true skips Supabase's own confirmation-email step, same reasoning as createAuthUser: this is already an authenticated, password-verified change (see changeAccountEmailAction), not a self-service signup. */
export async function updateAuthUserEmail(userId: string, newEmail: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { email: newEmail, email_confirm: true });
  if (error) throw error;
}

/**
 * Triggers Supabase's own built-in recovery email (their template, their
 * mail sending — no SMTP/Google Cloud setup needed on our side). redirectTo
 * must be present in the project's Auth → URL Configuration → Redirect
 * URLs allow-list in the Supabase dashboard, or Supabase silently falls
 * back to the project's default Site URL instead.
 */
export async function sendPasswordResetEmail(email: string, redirectTo: string): Promise<void> {
  const supabase = getSupabaseAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

/**
 * Validates an access token handed to us by a client component (read from
 * the URL fragment after a recovery-email redirect — see
 * app/acceder/restablecer) and returns the user it belongs to. Works with
 * any client instance, since the token itself carries the identity; used
 * so the confirm-new-password step never needs the anon key in the
 * browser (see components/registro/NSResetPasswordForm.tsx).
 */
export async function getUserFromAccessToken(accessToken: string): Promise<AuthUser | null> {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

/** Used only when hard-deleting a tenant (app/superadmin/actions.ts) — removes the owner's Supabase Auth account so it doesn't outlive the tenant it belonged to. */
export async function deleteAuthUser(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}

// ---------- TOTP (Super Admin two-factor authentication) ----------
//
// Every call below (past the first) needs a LIVE, already-authenticated
// Supabase Auth session for the specific user it acts on — GoTrue's MFA
// API is deliberately self-service-only (not delegable via the
// service_role key, unlike everything else in this file), so there is no
// admin-side shortcut to enroll/verify/unenroll on someone else's behalf.
// That session is obtained once via verifyEmailPasswordWithSession, then
// its tokens are threaded through the caller's own multi-step flow
// (Server Action bound args for login's TOTP challenge, same for
// enrollment) and restored here via setSession() on a fresh, uncached
// client (see createSupabaseAuthSessionClient's own comment for why not
// the shared singleton).

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

/** Like verifyEmailPassword, but also returns the session's own tokens — needed only by callers (accederAction's TOTP step, TOTP enrollment) that must carry this exact session forward into a follow-up MFA call. */
export async function verifyEmailPasswordWithSession(
  email: string,
  password: string,
): Promise<{ user: AuthUser; session: AuthSession } | null> {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) return null;
  return {
    user: { id: data.user.id, email: data.user.email ?? email },
    session: { accessToken: data.session.access_token, refreshToken: data.session.refresh_token },
  };
}

async function sessionClient(session: AuthSession) {
  const supabase = createSupabaseAuthSessionClient();
  const { error } = await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  if (error) throw error;
  return supabase;
}

export interface TotpEnrollment {
  factorId: string;
  /** Inline SVG markup (Supabase's own QR rendering) — render directly, no QR library needed. */
  qrCodeSvg: string;
  /** Manual-entry fallback for an authenticator app that can't scan the QR code. */
  secret: string;
}

/**
 * Starts TOTP enrollment. The returned factor stays unverified — useless
 * for actually gating login — until confirmTotpEnrollment succeeds with a
 * real code from the user's authenticator app.
 */
export async function enrollTotpFactor(session: AuthSession): Promise<TotpEnrollment> {
  const supabase = await sessionClient(session);
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "DS Catalog" });
  if (error) throw error;
  return { factorId: data.id, qrCodeSvg: data.totp.qr_code, secret: data.totp.secret };
}

/** Confirms a factor from enrollTotpFactor with the first code from the authenticator app — only after this does it actually protect login. */
export async function confirmTotpEnrollment(session: AuthSession, factorId: string, code: string): Promise<boolean> {
  const supabase = await sessionClient(session);
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  return !error;
}

/** Verifies a login-time TOTP code against an already-verified factor. Returns false (never throws) for a wrong/expired code — mirrors verifyEmailPassword's own null-for-wrong-credentials convention; only a real infra error throws. */
export async function verifyTotpCode(session: AuthSession, factorId: string, code: string): Promise<boolean> {
  const supabase = await sessionClient(session);
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  return !error;
}

/** Disables 2FA — removes the factor. Requires the same live re-authenticated session as enrolling one (see the section comment above). */
export async function unenrollTotpFactor(session: AuthSession, factorId: string): Promise<void> {
  const supabase = await sessionClient(session);
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
}

/**
 * Reads a user's enrolled TOTP factors via the Admin API — no live session
 * needed, since this is a read our own server performs (to show current
 * 2FA status, and at login time to decide whether a challenge is even
 * required), not a self-service action the user is performing themselves.
 */
export async function listTotpFactors(userId: string): Promise<{ id: string; verified: boolean }[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) throw error;
  return (data.user.factors ?? [])
    .filter((f) => f.factor_type === "totp")
    .map((f) => ({ id: f.id, verified: f.status === "verified" }));
}
