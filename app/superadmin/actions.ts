"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySuperadminSession, getAuthenticatedSuperadmin } from "@/lib/auth/superadmin-auth";
import { createAdminSession, markImpersonatedSession } from "@/lib/auth/admin-auth";
import { createAuthUser, deleteAuthUser, sendPasswordResetEmail } from "@/lib/auth/supabase-auth";
import {
  createAppUser,
  deleteAppUserByTenantId,
  getAppUserByTenantId,
  isAppUserEmailTaken,
} from "@/lib/repositories/app-users-repository";
import {
  cancelAccountDeletionRequest,
  createDefaultSettings,
  createTenant,
  deleteTenant,
  getTenantById,
  isTenantSlugTaken,
  updateTenantBusinessType,
  updateTenantStatus,
  updateTenantTheme,
} from "@/lib/repositories/tenant-repository";
import { updateSettings } from "@/lib/repositories/settings-repository";
import { seedStarterCategories } from "@/lib/repositories/category-repository";
import { createPlan, updatePlan, setPlanActive, type PlanInput } from "@/lib/repositories/plans-repository";
import {
  assignPlanToTenant,
  updateSubscriptionStatus,
  getSubscriptionByTenantId,
  approvePlanChangeRequest,
  clearPlanChangeRequest,
  type SubscriptionStatus,
} from "@/lib/repositories/subscriptions-repository";
import { deleteAllFilesForTenant } from "@/lib/repositories/storage-repository";
import { updatePlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { randomBytes } from "node:crypto";
import { siteConfig } from "@/lib/config/site";
import { slugify } from "@/lib/utils/slug";
import { RESERVED_SLUGS } from "@/lib/utils/reserved-slugs";
import { BUSINESS_TYPE_PROFILES } from "@/lib/tenant/business-type";
import type { BusinessType, TenantStatus, ThemeKey } from "@/lib/types/tenant";

export type SuperadminActionState = { error?: string };

/** Throws if there's no valid superadmin session — every mutating action below calls this first, on top of what middleware.ts and app/superadmin/(shell)/layout.tsx already enforce for the pages these actions are called from. */
async function requireSuperadmin() {
  const superadmin = await getAuthenticatedSuperadmin();
  if (!superadmin) throw new Error("No autorizado.");
  return superadmin;
}

export async function superadminLogoutAction(): Promise<void> {
  await destroySuperadminSession();
  redirect("/acceder");
}

// ---------- Tenant management ----------

export async function updateTenantStatusAction(tenantId: string, status: TenantStatus): Promise<void> {
  await requireSuperadmin();
  await updateTenantStatus(tenantId, status);
  revalidatePath("/superadmin/tenants");
  revalidatePath(`/superadmin/tenants/${tenantId}`);
  revalidatePath("/superadmin");
}

/**
 * Reclassifying only changes which optional fields the tenant's own
 * product form shows going forward — it never touches existing
 * products/categories, so this is safe to change at any time. One button
 * per business type (bound with both tenantId and businessType, same
 * pattern as updateTenantStatusAction above), not a <select> + submit —
 * React resets an uncontrolled form field to its original value right
 * after a plain Server Action succeeds, which made a select-based version
 * of this look like it silently reverted even though the save itself
 * always worked.
 */
export async function updateTenantBusinessTypeAction(tenantId: string, businessType: BusinessType): Promise<void> {
  await requireSuperadmin();
  await updateTenantBusinessType(tenantId, businessType);
  revalidatePath(`/superadmin/tenants/${tenantId}`);
}

/**
 * Swaps which Theme (lib/themes/registry.ts) renders this tenant's public
 * storefront. Same one-button-per-option pattern as
 * updateTenantBusinessTypeAction above, for the same reason: React resets
 * an uncontrolled field right after a plain Server Action succeeds, which
 * makes a <select> here look like it silently reverted even on success.
 */
export async function updateTenantThemeAction(tenantId: string, theme: ThemeKey): Promise<void> {
  await requireSuperadmin();
  await updateTenantTheme(tenantId, theme);
  revalidatePath(`/superadmin/tenants/${tenantId}`);
}

/**
 * Grants the caller a normal tenant-admin session for `tenantId` — the
 * exact same createAdminSession() a tenant admin gets after logging in
 * with their own password, so nothing in app/[tenant]/admin needs to know
 * or care that this session started from Super Admin. What DOES
 * distinguish it: markImpersonatedSession(), a second, separate cookie
 * that only flags "this session started as an impersonation" for the UI
 * (see app/[tenant]/admin/(shell)/layout.tsx) — see lib/auth/admin-auth.ts
 * for why it carries no auth weight of its own.
 *
 * Guarded by requireSuperadmin() — only a real, currently-active Super
 * Admin session can call this, verified server-side every time, never
 * trusted from a client-supplied tenantId alone.
 */
export async function impersonateTenantAction(tenantId: string): Promise<void> {
  await requireSuperadmin();
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new Error("Cliente no encontrado.");

  await createAdminSession(tenant.slug);
  await markImpersonatedSession(tenant.slug);

  redirect(`/${tenant.slug}/admin`);
}

// ---------- Create tenant ----------

/**
 * Invites someone to be a tenant's owner: creates their Supabase Auth
 * account with a random password nobody ever sees, links it via
 * ds_app_users, then sends Supabase's own "reset your password" email as
 * the invite — the person's first real action is setting their own
 * password, exactly like the self-service /registro flow, just kicked off
 * by the superadmin instead of by themselves. Shared by
 * createTenantBySuperadminAction (brand-new tenant) and
 * assignTenantOwnerEmailAction below (an existing tenant that predates
 * email-based login, e.g. elnuevosanchez/demo).
 */
async function inviteTenantOwner(tenantId: string, email: string): Promise<void> {
  const randomPassword = randomBytes(24).toString("base64url");
  const authUser = await createAuthUser(email, randomPassword);
  await createAppUser({ id: authUser.id, email, role: "owner", tenantId });
  await sendPasswordResetEmail(email, `${siteConfig.seo.domain}/acceder/restablecer`);
}

export async function createTenantBySuperadminAction(
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  const businessTypeInput = String(formData.get("businessType") ?? "");
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").replace(/[^0-9]/g, "");
  const brandDescription = String(formData.get("brandDescription") ?? "").trim();

  if (!name) return { error: "El nombre del negocio es obligatorio." };
  if (!ownerEmail || !ownerEmail.includes("@")) return { error: "Escribe el correo del administrador." };
  if (!(businessTypeInput in BUSINESS_TYPE_PROFILES)) return { error: "Elige el tipo de negocio." };
  const businessType = businessTypeInput as BusinessType;

  const slug = slugify(slugInput || name);
  if (!slug) return { error: "El slug no es válido. Usa letras, números y guiones." };
  if (RESERVED_SLUGS.has(slug)) return { error: `"${slug}" está reservado. Elige otro slug.` };
  if (await isTenantSlugTaken(slug)) return { error: `El slug "${slug}" ya está en uso.` };
  if (await isAppUserEmailTaken(ownerEmail)) return { error: "Ya existe una cuenta con ese correo." };

  const tenant = await createTenant({ slug, name, businessType });
  await createDefaultSettings(tenant.id, name);
  await seedStarterCategories(tenant.id, businessType);

  try {
    await inviteTenantOwner(tenant.id, ownerEmail);
  } catch {
    return { error: "El cliente se creó, pero no se pudo enviar la invitación por correo. Reenvíala desde su ficha." };
  }

  if (contactEmail || whatsappNumber || brandDescription) {
    await updateSettings(tenant.id, {
      ...(contactEmail ? { contactEmail } : {}),
      ...(whatsappNumber ? { whatsappNumber, whatsappDisplay: whatsappNumber } : {}),
      ...(brandDescription ? { brandDescription } : {}),
    });
  }

  revalidatePath("/superadmin/tenants");
  revalidatePath("/superadmin");
  redirect(`/superadmin/tenants/${tenant.id}`);
}

/**
 * For a tenant that has no owner account yet (created before email login
 * existed — elnuevosanchez, demo — or where the invite email needs
 * resending). Deletes any existing ds_app_users row for this tenant first
 * so re-inviting with a corrected email doesn't collide on the unique
 * tenant_id-per-owner assumption.
 */
export async function assignTenantOwnerEmailAction(
  tenantId: string,
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Escribe un correo válido." };
  if (await isAppUserEmailTaken(email)) return { error: "Ya existe una cuenta con ese correo." };

  await deleteAppUserByTenantId(tenantId);
  await inviteTenantOwner(tenantId, email);

  revalidatePath(`/superadmin/tenants/${tenantId}`);
  return { error: undefined };
}

// ---------- Plans ----------

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const n = Number.parseInt(str, 10);
  return Number.isFinite(n) ? n : null;
}

function parsePlanFormFields(formData: FormData): Omit<PlanInput, "key"> {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceCents: Math.round(Number(formData.get("price") ?? 0) * 100),
    maxProducts: parseOptionalInt(formData.get("maxProducts")),
    maxStorageMb: parseOptionalInt(formData.get("maxStorageMb")),
    maxImages: parseOptionalInt(formData.get("maxImages")),
    features: String(formData.get("features") ?? "")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean),
  };
}

export async function createPlanAction(
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const key = slugify(String(formData.get("key") ?? "").trim());
  const fields = parsePlanFormFields(formData);
  if (!key || !fields.name) return { error: "Clave y nombre son obligatorios." };

  try {
    await createPlan({ key, ...fields });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/duplicate key|unique constraint/i.test(message)) {
      return { error: `Ya existe un plan con la clave "${key}".` };
    }
    return { error: `No se pudo crear el plan: ${message}` };
  }

  revalidatePath("/superadmin/plans");
  revalidatePath("/");
  redirect("/superadmin/plans");
}

export async function updatePlanAction(
  planId: string,
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const fields = parsePlanFormFields(formData);
  if (!fields.name) return { error: "El nombre es obligatorio." };

  try {
    await updatePlan(planId, fields);
  } catch (err) {
    return { error: `No se pudo actualizar el plan: ${err instanceof Error ? err.message : String(err)}` };
  }

  revalidatePath("/superadmin/plans");
  revalidatePath("/");
  redirect("/superadmin/plans");
}

export async function togglePlanActiveAction(planId: string, active: boolean): Promise<void> {
  await requireSuperadmin();
  await setPlanActive(planId, active);
  revalidatePath("/superadmin/plans");
  revalidatePath("/");
}

// ---------- Subscriptions ----------

export async function assignPlanAction(tenantId: string, formData: FormData): Promise<void> {
  await requireSuperadmin();

  const planId = String(formData.get("planId") ?? "");
  const status = String(formData.get("status") ?? "trial") as SubscriptionStatus;
  const expiresAtInput = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresAtInput ? new Date(expiresAtInput).toISOString() : null;

  if (!planId) return;

  await assignPlanToTenant(tenantId, planId, status, expiresAt);
  revalidatePath(`/superadmin/tenants/${tenantId}`);
  revalidatePath("/superadmin/subscriptions");
}

export async function updateSubscriptionStatusAction(tenantId: string, status: SubscriptionStatus): Promise<void> {
  await requireSuperadmin();
  await updateSubscriptionStatus(tenantId, status);
  revalidatePath(`/superadmin/tenants/${tenantId}`);
  revalidatePath("/superadmin/subscriptions");
}

/** From /admin/cuenta's "solicitar cambio de plan" — moves the tenant onto the requested plan and marks it active in one step. No-op if there's no request (button shouldn't be reachable in that state, but never trust the client alone). */
export async function approvePlanChangeAction(tenantId: string): Promise<void> {
  await requireSuperadmin();
  const subscription = await getSubscriptionByTenantId(tenantId);
  if (!subscription?.requestedPlanId) return;
  await approvePlanChangeRequest(tenantId, subscription.requestedPlanId);
  revalidatePath(`/superadmin/tenants/${tenantId}`);
  revalidatePath("/superadmin/subscriptions");
  revalidatePath("/superadmin");
}

/** Keeps the tenant on their current plan — just clears the request without changing anything. */
export async function dismissPlanChangeRequestAction(tenantId: string): Promise<void> {
  await requireSuperadmin();
  await clearPlanChangeRequest(tenantId);
  revalidatePath(`/superadmin/tenants/${tenantId}`);
  revalidatePath("/superadmin");
}

/** Clears a tenant's "solicitar eliminación de cuenta" flag without deleting anything — actually deleting still goes through deleteTenantAction's typed-slug confirmation below. */
export async function dismissDeletionRequestAction(tenantId: string): Promise<void> {
  await requireSuperadmin();
  await cancelAccountDeletionRequest(tenantId);
  revalidatePath(`/superadmin/tenants/${tenantId}`);
  revalidatePath("/superadmin");
}

// ---------- Delete tenant (hard delete) ----------

/**
 * Irreversible. Requires the caller to type the tenant's exact slug as
 * confirmation (checked here, server-side — never trust a client-side
 * confirm dialog alone for something this destructive). Deletes Storage
 * files first, then the database rows (see deleteTenant in
 * tenant-repository.ts for why that order and not the reverse): if the DB
 * delete fails, at least the tenant row survives to retry against, rather
 * than a dangling tenant with no files and admins unable to tell what
 * happened.
 */
export async function deleteTenantAction(
  tenantId: string,
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const tenant = await getTenantById(tenantId);
  if (!tenant) return { error: "Cliente no encontrado." };

  const confirmation = String(formData.get("confirmSlug") ?? "").trim();
  if (confirmation !== tenant.slug) {
    return { error: `Escribe "${tenant.slug}" exactamente para confirmar.` };
  }

  const owner = await getAppUserByTenantId(tenant.id);

  await deleteAllFilesForTenant(tenant.slug);
  await deleteTenant(tenant.id); // cascades ds_app_users via tenant_id FK

  if (owner) {
    await deleteAuthUser(owner.id).catch(() => {});
  }

  revalidatePath("/superadmin/tenants");
  revalidatePath("/superadmin");
  redirect("/superadmin/tenants");
}

// ---------- Configuración de plataforma ----------

/**
 * El único número de WhatsApp de soporte de toda la plataforma — se ve en
 * la landing pública, en el panel de cada tenant y en su página de cuenta
 * suspendida/pendiente. revalidatePath("/") porque la landing lo muestra
 * y de otro modo quedaría cacheado con el valor viejo hasta el próximo
 * deploy.
 */
export async function updatePlatformSettingsAction(
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const supportWhatsappNumber = String(formData.get("supportWhatsappNumber") ?? "").replace(/[^0-9]/g, "");
  const supportWhatsappDisplay = String(formData.get("supportWhatsappDisplay") ?? "").trim();

  if (!supportWhatsappNumber) {
    return { error: "Escribe el número de soporte (solo dígitos, con código de país)." };
  }

  await updatePlatformSettings({ supportWhatsappNumber, supportWhatsappDisplay });

  revalidatePath("/superadmin/configuracion");
  revalidatePath("/");
  return {};
}
