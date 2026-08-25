"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/auth/admin-auth";
import { createAuthUser } from "@/lib/auth/supabase-auth";
import { createAppUser, isAppUserEmailTaken } from "@/lib/repositories/app-users-repository";
import { createDefaultSettings, createTenant, isTenantSlugTaken } from "@/lib/repositories/tenant-repository";
import { seedStarterCategories } from "@/lib/repositories/category-repository";
import { BUSINESS_TYPE_PROFILES } from "@/lib/tenant/business-type";
import type { BusinessType } from "@/lib/types/tenant";
import { slugify } from "@/lib/utils/slug";
import { RESERVED_SLUGS } from "@/lib/utils/reserved-slugs";
import type { ActionState } from "@/app/[tenant]/admin/actions";

export async function registerTenantAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const businessTypeInput = String(formData.get("businessType") ?? "");

  if (!name) {
    return { error: "El nombre del negocio es obligatorio." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Escribe un correo válido." };
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
  if (await isAppUserEmailTaken(email)) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  let authUserId: string;
  try {
    const authUser = await createAuthUser(email, password);
    authUserId = authUser.id;
  } catch {
    return { error: "No se pudo crear la cuenta con ese correo. Prueba con otro." };
  }

  const tenant = await createTenant({ slug, name, businessType });
  await createDefaultSettings(tenant.id, name);
  await seedStarterCategories(tenant.id, businessType);
  await createAppUser({ id: authUserId, email, role: "owner", tenantId: tenant.id });
  await createAdminSession(tenant.slug);

  redirect(`/${tenant.slug}/admin/onboarding`);
}
