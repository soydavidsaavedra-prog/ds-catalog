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
import { deleteAllBackupCodes, generateBackupCodes } from "@/lib/auth/totp-backup-codes";

export type SeguridadActionState = {
  error?: string;
  success?: string;
  enrollment?: TotpEnrollment & { session: AuthSession };
  /** Plaintext, one-time reveal — see lib/auth/totp-backup-codes.ts's own comment on why this is the only moment they exist unhashed. */
  backupCodes?: string[];
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

/**
 * Step 2: confirms the factor from startTotpEnrollmentAction with the
 * first code from the authenticator app — only after this does 2FA
 * actually protect login. Also generates this account's backup codes
 * right here, since 2FA isn't really "on" in a safe way until there's a
 * recovery path for a lost device — see totp-backup-codes.ts.
 */
export async function confirmTotpEnrollmentAction(
  session: AuthSession,
  factorId: string,
  _prev: SeguridadActionState,
  formData: FormData,
): Promise<SeguridadActionState> {
  const superadmin = await requireSuperadmin();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Escribe el código de 6 dígitos." };

  let backupCodes: string[];
  try {
    const ok = await confirmTotpEnrollment(session, factorId, code);
    if (!ok) return { error: "Código incorrecto. Intenta de nuevo." };
    backupCodes = await generateBackupCodes(superadmin.id);
  } catch (err) {
    console.error("[seguridad] failed to confirm TOTP enrollment:", err);
    return { error: "No se pudo confirmar. Intenta de nuevo." };
  }

  revalidatePath("/superadmin/seguridad");
  return { success: "Verificación en dos pasos activada.", backupCodes };
}

/** Disabling needs the same fresh password confirm as enrolling — removes every TOTP factor on the account (active or not) and every backup code, which would otherwise sit around still individually valid to "recover into" 2FA that no longer exists. */
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
    await deleteAllBackupCodes(superadmin.id);
  } catch (err) {
    console.error("[seguridad] failed to disable TOTP:", err);
    return { error: "No se pudo desactivar. Intenta de nuevo." };
  }

  revalidatePath("/superadmin/seguridad");
  return { success: "Verificación en dos pasos desactivada." };
}

/** Invalidates every existing backup code and issues a fresh set — for a Super Admin who used some/all of theirs, or just wants a clean set. Same fresh-password requirement as the flows above (this is, after all, a security-recovery mechanism). */
export async function regenerateBackupCodesAction(
  _prev: SeguridadActionState,
  formData: FormData,
): Promise<SeguridadActionState> {
  const superadmin = await requireSuperadmin();
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Escribe tu contraseña." };

  let backupCodes: string[];
  try {
    const verified = await verifyEmailPasswordWithSession(superadmin.email, password);
    if (!verified) return { error: "Contraseña incorrecta." };
    backupCodes = await generateBackupCodes(superadmin.id);
  } catch (err) {
    console.error("[seguridad] failed to regenerate backup codes:", err);
    return { error: "No se pudo regenerar. Intenta de nuevo." };
  }

  revalidatePath("/superadmin/seguridad");
  return { backupCodes };
}
