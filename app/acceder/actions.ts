"use server";

import { redirect } from "next/navigation";
import { createAdminSession, verifyTenantAdminPassword } from "@/lib/auth/admin-auth";
import { getTenantAuthRecord } from "@/lib/repositories/tenant-repository";
import { slugify } from "@/lib/utils/slug";

export type AccederActionState = { error?: string };

/**
 * Central login entry point — the platform-level "Acceder" a tenant admin
 * doesn't already have a slug-scoped URL bookmarked types their catalog's
 * own slug here instead of navigating to /{slug}/admin/login directly.
 * Reuses the exact same verifyTenantAdminPassword/createAdminSession as
 * that per-tenant login (lib/auth/admin-auth.ts) — this isn't a new auth
 * mechanism, just a different front door onto it.
 */
export async function accederAction(_prev: AccederActionState, formData: FormData): Promise<AccederActionState> {
  const slug = slugify(String(formData.get("slug") ?? "").trim());
  const password = String(formData.get("password") ?? "");

  if (!slug || !password) {
    return { error: "Escribe el enlace de tu catálogo y tu contraseña." };
  }

  // Checked explicitly (rather than leaving it to verifyTenantAdminPassword
  // alone) so a nonexistent slug can never fall through to matching the
  // shared ADMIN_PASSWORD fallback — and either way, one generic message,
  // never revealing which of the two was wrong.
  const record = await getTenantAuthRecord(slug);
  if (!record || !(await verifyTenantAdminPassword(slug, password))) {
    return { error: "Enlace o contraseña incorrectos." };
  }

  await createAdminSession(slug);
  redirect(`/${slug}/admin`);
}
