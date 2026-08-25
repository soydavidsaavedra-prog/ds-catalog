import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { buildAccentOverrideCss } from "@/lib/utils/brand";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin — DS Catalog" },
  robots: { index: false, follow: false },
};

/**
 * Wraps every /[tenant]/admin/* route (login, onboarding, and the
 * authenticated (shell) — see app/[tenant]/admin/(shell)/layout.tsx for
 * the auth check and sidebar) so a tenant's accent color override applies
 * consistently across all of them from one place, not duplicated per page.
 */
export default async function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const settings = await getSettings(tenant.id);
  const accentOverrideCss = buildAccentOverrideCss(settings);

  return (
    <>
      {accentOverrideCss ? <style>{accentOverrideCss}</style> : null}
      {children}
    </>
  );
}
