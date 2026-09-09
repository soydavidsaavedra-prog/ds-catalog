"use server";

import { revalidatePath } from "next/cache";
import { getAppUserByTenantId, updateAppUserEmail, isAppUserEmailTaken } from "@/lib/repositories/app-users-repository";
import { verifyEmailPassword, updateAuthUserEmail, setUserPassword } from "@/lib/auth/supabase-auth";
import {
  getSubscriptionByTenantId,
  requestPlanChange,
  clearPlanChangeRequest,
} from "@/lib/repositories/subscriptions-repository";
import { getPlanById } from "@/lib/repositories/plans-repository";
import { requestAccountDeletion, cancelAccountDeletionRequest } from "@/lib/repositories/tenant-repository";

export type AccountActionState = { error?: string; success?: boolean };

const NO_LOGIN_ACCOUNT_ERROR =
  "Tu cuenta todavía no tiene un correo de acceso asignado — contáctanos para configurarlo.";

/**
 * Every action here re-derives the ds_app_users row from tenantId instead
 * of trusting a client-supplied id, and the two credential-changing ones
 * (email/password) additionally re-verify the CURRENT password before
 * doing anything — the admin session cookie alone proves "you're logged
 * into this tenant", not "you should be allowed to change its login
 * credentials", the same reasoning /acceder's own login applies.
 */

export async function requestPlanChangeAction(
  tenantId: string,
  tenantSlug: string,
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const planId = String(formData.get("planId") ?? "");

  const subscription = await getSubscriptionByTenantId(tenantId);
  if (!subscription) {
    return { error: "Todavía no tienes un plan asignado — contáctanos para elegir uno." };
  }
  if (planId === subscription.planId) {
    return { error: "Ya tienes ese plan." };
  }
  const plan = await getPlanById(planId);
  if (!plan || !plan.active) {
    return { error: "Elige un plan válido." };
  }

  await requestPlanChange(tenantId, planId);
  revalidatePath(`/${tenantSlug}/admin/cuenta`);
  return { success: true };
}

export async function cancelPlanChangeRequestAction(tenantId: string, tenantSlug: string): Promise<void> {
  await clearPlanChangeRequest(tenantId);
  revalidatePath(`/${tenantSlug}/admin/cuenta`);
}

export async function changeAccountEmailAction(
  tenantId: string,
  tenantSlug: string,
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const newEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!newEmail || !newEmail.includes("@")) {
    return { error: "Escribe un correo válido." };
  }
  if (!currentPassword) {
    return { error: "Escribe tu contraseña actual para confirmar el cambio." };
  }

  const appUser = await getAppUserByTenantId(tenantId);
  if (!appUser) return { error: NO_LOGIN_ACCOUNT_ERROR };

  if (!(await verifyEmailPassword(appUser.email, currentPassword))) {
    return { error: "Tu contraseña actual no es correcta." };
  }
  if (newEmail === appUser.email) {
    return { error: "Ese ya es tu correo actual." };
  }
  if (await isAppUserEmailTaken(newEmail)) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  try {
    await updateAuthUserEmail(appUser.id, newEmail);
    await updateAppUserEmail(appUser.id, newEmail);
  } catch {
    return { error: "No se pudo actualizar el correo. Intenta de nuevo en un momento." };
  }

  revalidatePath(`/${tenantSlug}/admin/cuenta`);
  return { success: true };
}

export async function changeAccountPasswordAction(
  tenantId: string,
  tenantSlug: string,
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas nuevas no coinciden." };
  }

  const appUser = await getAppUserByTenantId(tenantId);
  if (!appUser) return { error: NO_LOGIN_ACCOUNT_ERROR };

  if (!(await verifyEmailPassword(appUser.email, currentPassword))) {
    return { error: "Tu contraseña actual no es correcta." };
  }

  try {
    await setUserPassword(appUser.id, newPassword);
  } catch {
    return { error: "No se pudo actualizar la contraseña. Intenta de nuevo en un momento." };
  }

  revalidatePath(`/${tenantSlug}/admin/cuenta`);
  return { success: true };
}

export async function requestAccountDeletionAction(tenantId: string, tenantSlug: string): Promise<void> {
  await requestAccountDeletion(tenantId);
  revalidatePath(`/${tenantSlug}/admin/cuenta`);
}

export async function cancelAccountDeletionRequestAction(tenantId: string, tenantSlug: string): Promise<void> {
  await cancelAccountDeletionRequest(tenantId);
  revalidatePath(`/${tenantSlug}/admin/cuenta`);
}
