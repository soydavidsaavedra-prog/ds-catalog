"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/auth/admin-auth";
import { createSuperadminSession, verifySuperadminCredentials } from "@/lib/auth/superadmin-auth";
import {
  createAuthUser,
  verifyEmailPassword,
  sendPasswordResetEmail,
  getUserFromAccessToken,
  setUserPassword,
} from "@/lib/auth/supabase-auth";
import { getAppUserById, getAppUserByEmail, createAppUser } from "@/lib/repositories/app-users-repository";
import { getTenantById } from "@/lib/repositories/tenant-repository";
import { siteConfig } from "@/lib/config/site";

export type AccederActionState = { error?: string };

const GENERIC_ERROR = "Correo o contraseña incorrectos.";

/**
 * Any of the Supabase calls below can throw for reasons that have nothing
 * to do with the credentials being wrong (a missing/misconfigured
 * SUPABASE_ANON_KEY, a transient network error) — those are ours to fix,
 * not the visitor's, so they get a distinct, honest message instead of
 * being lumped in with GENERIC_ERROR, and the real error still goes to the
 * server logs (Vercel → Deployments → Functions) for us to diagnose.
 */
function authErrorMessage(err: unknown): string {
  console.error("[acceder] auth call failed:", err);
  return "No se pudo verificar tu sesión ahora mismo. Intenta de nuevo en un momento.";
}

/**
 * Central login entry point — the ONE login for both tenant owners and
 * Super Admin (previously two separate pages/systems: /superadmin/login
 * and a per-tenant /{slug}/admin/login). Identity now lives in Supabase
 * Auth; ds_app_users is just the profile (role + which tenant, if any)
 * attached to that Supabase Auth user id.
 *
 * Every Supabase call is inside the try/catch, and the one call that can
 * redirect() (signInAndRedirect) is deliberately outside it — redirect()
 * works by throwing a special Next.js control-flow error, and a try/catch
 * wrapped around it would swallow that throw and break the redirect.
 */
export async function accederAction(_prev: AccederActionState, formData: FormData): Promise<AccederActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Escribe tu correo y tu contraseña." };
  }

  let resolvedUserId: string | null = null;

  try {
    const authUser = await verifyEmailPassword(email, password);
    if (authUser) {
      resolvedUserId = authUser.id;
    } else {
      // Auto-migración de una sola vez: cuentas de Super Admin creadas
      // antes de este cambio (scripts/create-superadmin.ts, tabla
      // super_admin_users) no existen todavía en Supabase Auth. Si el
      // intento contra Supabase Auth falló pero esta contraseña coincide
      // con la cuenta legada, provisionamos la identidad real ahora mismo
      // con la MISMA contraseña — el resto de logins de esta persona ya
      // nunca vuelven a tocar esta rama.
      const legacySuperadmin = await verifySuperadminCredentials(email, password);
      if (legacySuperadmin) {
        const migrated = await createAuthUser(legacySuperadmin.email, password);
        await createAppUser({ id: migrated.id, email: migrated.email, role: "superadmin", tenantId: null });
        resolvedUserId = migrated.id;
      }
    }
  } catch (err) {
    return { error: authErrorMessage(err) };
  }

  if (!resolvedUserId) {
    return { error: GENERIC_ERROR };
  }

  return signInAndRedirect(resolvedUserId);
}

/** Shared by a normal login and the legacy-migration path above — looks up the ds_app_users profile and starts the right kind of session. Never returns on success (redirect() throws). */
async function signInAndRedirect(appUserId: string): Promise<AccederActionState> {
  let appUser;
  try {
    appUser = await getAppUserById(appUserId);
  } catch (err) {
    return { error: authErrorMessage(err) };
  }
  if (!appUser) {
    return { error: GENERIC_ERROR };
  }

  if (appUser.role === "superadmin") {
    await createSuperadminSession(appUser.id);
    redirect("/superadmin");
  }

  let tenant = null;
  try {
    tenant = appUser.tenantId ? await getTenantById(appUser.tenantId) : null;
  } catch (err) {
    return { error: authErrorMessage(err) };
  }
  if (!tenant) {
    return { error: GENERIC_ERROR };
  }

  await createAdminSession(tenant.slug);
  redirect(`/${tenant.slug}/admin?bienvenida=1`);
}

export type RecuperarActionState = { error?: string; success?: boolean };

/** Request step — always reports success even if the email doesn't match any account, so this can't be used to enumerate registered emails. */
export async function requestPasswordResetAction(
  _prev: RecuperarActionState,
  formData: FormData,
): Promise<RecuperarActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Escribe tu correo." };
  }

  try {
    const appUser = await getAppUserByEmail(email);
    if (appUser) {
      await sendPasswordResetEmail(email, `${siteConfig.seo.domain}/acceder/restablecer`);
    }
  } catch (err) {
    return { error: authErrorMessage(err) };
  }

  return { success: true };
}

export type ResetPasswordActionState = { error?: string };

/**
 * Confirm step — accessToken comes from the URL fragment Supabase's
 * recovery email redirected to (#access_token=...&type=recovery), read
 * client-side by NSResetPasswordForm since fragments never reach the
 * server on their own. Validating it here (server-side, via the Auth
 * client) and setting the new password through the Admin API means the
 * anon key never has to reach the browser for this flow — see
 * lib/auth/supabase-auth.ts's comment on getUserFromAccessToken.
 */
export async function resetPasswordAction(
  accessToken: string,
  _prev: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  let resolvedUserId: string;

  try {
    const authUser = await getUserFromAccessToken(accessToken);
    if (!authUser) {
      return { error: "El enlace no es válido o ya expiró. Solicita uno nuevo desde /acceder/recuperar." };
    }
    await setUserPassword(authUser.id, password);
    resolvedUserId = authUser.id;
  } catch (err) {
    return { error: authErrorMessage(err) };
  }

  return signInAndRedirect(resolvedUserId);
}
