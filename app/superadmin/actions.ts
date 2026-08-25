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
  getTenantById,
  isTenantSlugTaken,
  updateTenantStatus,
} from "@/lib/repositories/tenant-repository";
import { updateSettings } from "@/lib/repositories/settings-repository";
import { createPlan, setPlanActive, type PlanInput } from "@/lib/repositories/plans-repository";
import {
  assignPlanToTenant,
  updateSubscriptionStatus,
  type SubscriptionStatus,
} from "@/lib/repositories/subscriptions-repository";
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

export async function createPlanAction(
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  await requireSuperadmin();

  const key = slugify(String(formData.get("key") ?? "").trim());
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceCents = Math.round(Number(formData.get("price") ?? 0) * 100);
  const maxProducts = parseOptionalInt(formData.get("maxProducts"));
  const maxStorageMb = parseOptionalInt(formData.get("maxStorageMb"));
  const maxImages = parseOptionalInt(formData.get("maxImages"));
  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  if (!key || !name) return { error: "Clave y nombre son obligatorios." };

  const input: PlanInput = { key, name, description, priceCents, maxProducts, maxStorageMb, maxImages, features };
  try {
    await createPlan(input);
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

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const n = Number.parseInt(str, 10);
  return Number.isFinite(n) ? n : null;
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
