import "server-only";
import { getSupabaseClient, getSupabaseAuthClient } from "@/lib/db/supabaseClient";

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
