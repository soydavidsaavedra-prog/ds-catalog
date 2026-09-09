import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { isAdminAuthenticated, isImpersonatedSession } from "@/lib/auth/admin-auth";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { NSAdminShellChrome } from "@/components/admin/NSAdminShellChrome";

/**
 * Mi cuenta gets the exact same sidebar/container chrome as every page
 * under (shell) (via the shared NSAdminShellChrome) — but through its OWN
 * layout, deliberately never (shell)'s: (shell)/layout.tsx redirects a
 * frozen tenant (pending/expired/cancelled subscription) to
 * /admin/suspended, a dead-end screen with no way to manage the account.
 * Mi cuenta is exactly where a frozen tenant needs to still be able to
 * land — to request a different plan (NSAccountPlanCard) or request
 * deleting the account (NSAccountDangerZone) — so this only ever applies
 * the same auth check every admin page has, never the freeze redirect.
 */
export default async function AdminAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  if (!(await isAdminAuthenticated(tenantSlug))) {
    redirect(`/acceder?tenant=${tenantSlug}`);
  }
  const impersonating = await isImpersonatedSession();
  const [settings, platformSettings] = await Promise.all([getSettings(tenant.id), getPlatformSettings()]);

  return (
    <NSAdminShellChrome
      tenantSlug={tenantSlug}
      logoSrc={settings.brandLogo}
      brandName={settings.brandName}
      tagline={settings.heroSubtitle}
      impersonating={impersonating}
      supportWhatsappNumber={platformSettings.supportWhatsappNumber}
    >
      {children}
    </NSAdminShellChrome>
  );
}
