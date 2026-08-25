"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/auth/admin-auth";
import { hashTenantPassword } from "@/lib/auth/tenant-credentials";
import { createDefaultSettings, createTenant, isTenantSlugTaken } from "@/lib/repositories/tenant-repository";
import { seedStarterCategories } from "@/lib/repositories/category-repository";
import { BUSINESS_TYPE_PROFILES } from "@/lib/tenant/business-type";
import type { BusinessType } from "@/lib/types/tenant";
import { slugify } from "@/lib/utils/slug";
import { RESERVED_SLUGS } from "@/lib/utils/reserved-slugs";
import type { ActionState } from "@/app/[tenant]/admin/actions";

export async function registerTenantAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const businessTypeInput = String(formData.get("businessType") ?? "");

  if (!name) {
    return { error: "El nombre del negocio es obligatorio." };
  }
  if (!(businessTypeInput in BUSINESS_TYPE_PROFILES)) {
    return { error: "Elige el tipo de negocio." };
  }
  const businessType = businessTypeInput as BusinessType;
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const slug = slugify(slugInput || name);
  if (!slug) {
    return { error: "El enlace de tu catálogo no es válido. Usa letras, números y guiones." };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { error: `"${slug}" está reservado. Elige otro enlace para tu catálogo.` };
  }
  if (await isTenantSlugTaken(slug)) {
    return { error: `El enlace "${slug}" ya está en uso. Prueba con "${slug}-2" o elige otro.` };
  }

  const adminPasswordHash = hashTenantPassword(password);
  const tenant = await createTenant({ slug, name, adminPasswordHash, businessType });
  await createDefaultSettings(tenant.id, name);
  await seedStarterCategories(tenant.id, businessType);
  await createAdminSession(tenant.slug);

  redirect(`/${tenant.slug}/admin/onboarding`);
}
