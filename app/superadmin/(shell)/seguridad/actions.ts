"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedSuperadmin } from "@/lib/auth/superadmin-auth";
import {
  confirmTotpEnrollment,
  enrollTotpFactor,
  listTotpFactors,
  unenrollTotpFactor,
  verifyEmailPasswordWithSession,
  type AuthSession,
  type TotpEnrollment,
} from "@/lib/auth/supabase-auth";

export type SeguridadActionState = {
  error?: string;
  success?: string;
  enrollment?: TotpEnrollment & { session: AuthSession };
};

async function requireSuperadmin() {
  const superadmin = await getAuthenticatedSuperadmin();
  if (!superadmin) throw new Error("No autorizado.");
  return superadmin;
}

/**
 * Step 1 of turning 2FA on: re-verifies the current password to obtain a
 * live Supabase session (required — see lib/auth/supabase-auth.ts's TOTP
 * section for why there's no admin-side shortcut), then starts
 * enrollment. Any previously abandoned, never-confirmed factor for this
 * account is removed first so retrying doesn't pile up dead factors.
 */
export async function startTotpEnrollmentAction(
  _prev: SeguridadActionState,
  formData: FormData,
): Promise<SeguridadActionState> {
  const superadmin = await requireSuperadmin();
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Escribe tu contraseña." };

  try {
    const verified = await verifyEmailPasswordWithSession(superadmin.email, password);
    if (!verified) return { error: "Contraseña incorrecta." };

    const existing = await listTotpFactors(superadmin.id);
    for (const factor of existing.filter((f) => !f.verified)) {
      await unenrollTotpFactor(verified.session, factor.id).catch(() => {});
    }

    const enrollment = await enrollTotpFactor(verified.session);
    return { enrollment: { ...enrollment, session: verified.session } };
  } catch (err) {
    console.error("[seguridad] failed to start TOTP enrollment:", err);
    return { error: "No se pudo iniciar la activación. Intenta de nuevo." };
  }
}

/** Step 2: confirms the factor from startTotpEnrollmentAction with the first code from the authenticator app — only after this does 2FA actually protect login. */
export async function confirmTotpEnrollmentAction(
  session: AuthSession,
  factorId: string,
  _prev: SeguridadActionState,
  formData: FormData,
): Promise<SeguridadActionState> {
  await requireSuperadmin();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Escribe el código de 6 dígitos." };

  try {
    const ok = await confirmTotpEnrollment(session, factorId, code);
    if (!ok) return { error: "Código incorrecto. Intenta de nuevo." };
  } catch (err) {
    console.error("[seguridad] failed to confirm TOTP enrollment:", err);
    return { error: "No se pudo confirmar. Intenta de nuevo." };
  }

  revalidatePath("/superadmin/seguridad");
  return { success: "Verificación en dos pasos activada." };
}

/** Disabling needs the same fresh password confirm as enrolling — this removes every TOTP factor on the account, active or not. */
export async function disableTotpAction(
  _prev: SeguridadActionState,
  formData: FormData,
): Promise<SeguridadActionState> {
  const superadmin = await requireSuperadmin();
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Escribe tu contraseña." };

  try {
    const verified = await verifyEmailPasswordWithSession(superadmin.email, password);
    if (!verified) return { error: "Contraseña incorrecta." };

    const factors = await listTotpFactors(superadmin.id);
    for (const factor of factors) {
      await unenrollTotpFactor(verified.session, factor.id);
    }
  } catch (err) {
    console.error("[seguridad] failed to disable TOTP:", err);
    return { error: "No se pudo desactivar. Intenta de nuevo." };
  }

  revalidatePath("/superadmin/seguridad");
  return { success: "Verificación en dos pasos desactivada." };
}
