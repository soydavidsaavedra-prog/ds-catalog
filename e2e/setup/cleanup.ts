import type { SupabaseClient } from "@supabase/supabase-js";
import { TEST_OWNER_EMAIL, TEST_SUPERADMIN_EMAIL, TEST_TENANT_SLUG } from "./constants";

/**
 * Best-effort teardown of every fixture the E2E suite creates — run both
 * before global-setup (in case a previous run crashed mid-suite and left
 * stale data) and after global-teardown. Deleting the tenant cascades its
 * ds_app_users row and every ns_* row via FK (same on-delete-cascade
 * chain deleteTenant in lib/repositories/tenant-repository.ts relies on),
 * but that doesn't touch Supabase Auth — the auth users for both the
 * tenant owner and the standalone test Super Admin account are deleted
 * explicitly, same as deleteTenantAction's own hard-delete does for a
 * real tenant.
 */
export async function cleanupTestFixtures(supabase: SupabaseClient): Promise<void> {
  const { data: tenant } = await supabase.from("ds_tenants").select("id").eq("slug", TEST_TENANT_SLUG).maybeSingle();

  for (const email of [TEST_OWNER_EMAIL, TEST_SUPERADMIN_EMAIL]) {
    const { data: appUser } = await supabase.from("ds_app_users").select("id").eq("email", email).maybeSingle();
    if (appUser) {
      await supabase.auth.admin.deleteUser(appUser.id).catch(() => {});
      // Deleting the tenant below cascades the OWNER's row via tenant_id —
      // it does NOT touch the standalone Super Admin test row (tenant_id
      // is null there), so every row is deleted explicitly here instead
      // of relying on that cascade for either.
      await supabase.from("ds_app_users").delete().eq("id", appUser.id);
    }
  }

  if (tenant) {
    await supabase.from("ds_tenants").delete().eq("id", tenant.id);
  }
}
