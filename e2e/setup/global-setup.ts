import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { cleanupTestFixtures } from "./cleanup";
import {
  TEST_CATEGORY_NAME,
  TEST_CATEGORY_SLUG,
  TEST_OWNER_EMAIL,
  TEST_OWNER_PASSWORD,
  TEST_SUPERADMIN_EMAIL,
  TEST_SUPERADMIN_PASSWORD,
  TEST_TENANT_NAME,
  TEST_TENANT_SLUG,
} from "./constants";
import { createSupabaseAdminClient } from "./supabase-admin";

/**
 * Seeds everything the E2E suite logs into: one tenant (with one category,
 * so product-import.spec.ts has somewhere real to import into) and its
 * owner account, plus a completely separate, disposable Super Admin
 * account used only by super-admin-2fa.spec.ts — never the platform
 * operator's own real Super Admin account, so nothing in this suite can
 * ever touch real 2FA/session state.
 *
 * Cleans up any stale fixtures from a previous crashed run FIRST, so this
 * is safe to re-run without manual cleanup between attempts.
 */
export default async function globalSetup(): Promise<void> {
  const supabase = createSupabaseAdminClient();

  await cleanupTestFixtures(supabase);

  const { data: tenant, error: tenantError } = await supabase
    .from("ds_tenants")
    .insert({
      slug: TEST_TENANT_SLUG,
      name: TEST_TENANT_NAME,
      status: "active",
      business_type: "ferreteria",
      admin_password_hash: null,
      onboarding_completed: true,
    })
    .select("id")
    .single();
  if (tenantError) throw tenantError;

  const { error: settingsError } = await supabase.from("ns_settings").insert({
    tenant_id: tenant.id,
    brand_name: TEST_TENANT_NAME,
    hero_title_line1: TEST_TENANT_NAME,
    currency: "USD",
  });
  if (settingsError) throw settingsError;

  const { error: categoryError } = await supabase.from("ns_categories").insert({
    tenant_id: tenant.id,
    slug: TEST_CATEGORY_SLUG,
    name: TEST_CATEGORY_NAME,
    description: "",
    image: `placeholder:${TEST_CATEGORY_SLUG}:1`,
    order: 1,
    active: true,
    featured: true,
    parent_id: null,
  });
  if (categoryError) throw categoryError;

  const { data: ownerAuth, error: ownerAuthError } = await supabase.auth.admin.createUser({
    email: TEST_OWNER_EMAIL,
    password: TEST_OWNER_PASSWORD,
    email_confirm: true,
  });
  if (ownerAuthError) throw ownerAuthError;
  const { error: ownerProfileError } = await supabase
    .from("ds_app_users")
    .insert({ id: ownerAuth.user.id, email: TEST_OWNER_EMAIL, role: "owner", tenant_id: tenant.id });
  if (ownerProfileError) throw ownerProfileError;

  const { data: superadminAuth, error: superadminAuthError } = await supabase.auth.admin.createUser({
    email: TEST_SUPERADMIN_EMAIL,
    password: TEST_SUPERADMIN_PASSWORD,
    email_confirm: true,
  });
  if (superadminAuthError) throw superadminAuthError;
  const { error: superadminProfileError } = await supabase
    .from("ds_app_users")
    .insert({ id: superadminAuth.user.id, email: TEST_SUPERADMIN_EMAIL, role: "superadmin", tenant_id: null });
  if (superadminProfileError) throw superadminProfileError;
}
