"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSuperadminSession,
  destroySuperadminSession,
  getAuthenticatedSuperadmin,
  verifySuperadminCredentials,
} from "@/lib/auth/superadmin-auth";
import { createAdminSession, markImpersonatedSession } from "@/lib/auth/admin-auth";
import { hashTenantPassword } from "@/lib/auth/tenant-credentials";
import {
  createDefaultSettings,
  createTenant,
  deleteTenant,
  getTenantById,
  isTenantSlugTaken,
  updateTenantStatus,
} from "@/lib/repositories/tenant-repository";
import { updateSettings } from "@/lib/repositories/settings-repository";
import { createPlan, updatePlan, setPlanActive, type PlanInput } from "@/lib/repositories/plans-repository";
import {
  assignPlanToTenant,
  updateSubscriptionStatus,
  type SubscriptionStatus,
} from "@/lib/repositories/subscriptions-repository";
import { deleteAllFilesForTenant } from "@/lib/repositories/storage-repository";
import { slugify } from "@/lib/utils/slug";
import type { TenantStatus } from "@/lib/types/tenant";

export type SuperadminActionState = { error?: string };

/** Throws if there's no valid superadmin session — every mutating action below calls this first, on top of what middleware.ts and app/superadmin/(shell)/layout.tsx already enforce for the pages these actions are called from. */
async function requireSuperadmin() {
  const superadmin = await getAuthenticatedSuperadmin();
  if (!superadmin) throw new Error("No autorizado.");
  return superadmin;
}

export async function superadminLoginAction(
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await verifySuperadminCredentials(email, password);
  if (!user) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSuperadminSession(user.id);
  redirect("/superadmin");
}

export async function superadminLogoutAction(): Promise<void> {
  await destroySuperadminSession();
  redirect("/superadmin/login");
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

const RESERVED_SLUGS = new Set(["registro", "superadmin"]);

export async function createTenantBySuperadminAction(
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").replace(/[^0-9]/g, "");
  const brandDescription = String(formData.get("brandDescription") ?? "").trim();

  if (!name) return { error: "El nombre del negocio es obligatorio." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const slug = slugify(slugInput || name);
  if (!slug) return { error: "El slug no es válido. Usa letras, números y guiones." };
  if (RESERVED_SLUGS.has(slug)) return { error: `"${slug}" está reservado. Elige otro slug.` };
  if (await isTenantSlugTaken(slug)) return { error: `El slug "${slug}" ya está en uso.` };

  const tenant = await createTenant({ slug, name, adminPasswordHash: hashTenantPassword(password) });
  await createDefaultSettings(tenant.id, name);

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
  redirect("/superadmin/plans");
}

export async function togglePlanActiveAction(planId: string, active: boolean): Promise<void> {
  await requireSuperadmin();
  await setPlanActive(planId, active);
  revalidatePath("/superadmin/plans");
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

  await deleteAllFilesForTenant(tenant.slug);
  await deleteTenant(tenant.id);

  revalidatePath("/superadmin/tenants");
  revalidatePath("/superadmin");
  redirect("/superadmin/tenants");
}
