import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { isAdminAuthenticated, isImpersonatedSession } from "@/lib/auth/admin-auth";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getPlanStatusInfo, EXPIRY_WARNING_DAYS } from "@/lib/tenant/plan-limits";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { NSAdminSidebar } from "@/components/admin/NSAdminSidebar";
import { NSPlanExpiryBanner } from "@/components/admin/NSPlanExpiryBanner";

export default async function AdminShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  if (!(await isAdminAuthenticated(tenantSlug))) {
    redirect("/acceder");
  }
  const impersonating = await isImpersonatedSession();
  const planStatus = await getPlanStatusInfo(tenant.id);
  // The tenant's own session is frozen out the moment its plan expires —
  // but a Super Admin impersonating in to fix things (renew the plan,
  // check on the account) must still get through. See
  // lib/tenant/plan-limits.ts getPlanStatusInfo.
  if (!impersonating && planStatus.freezeReason) {
    redirect(`/${tenantSlug}/admin/suspended`);
  }
  const [settings, platformSettings] = await Promise.all([getSettings(tenant.id), getPlatformSettings()]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <NSAdminSidebar
        tenantSlug={tenantSlug}
        logoSrc={settings.brandLogo}
        brandName={settings.brandName}
        tagline={settings.heroSubtitle}
        impersonating={impersonating}
        supportWhatsappNumber={platformSettings.supportWhatsappNumber}
      />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
          {planStatus.daysUntilExpiry !== null && planStatus.daysUntilExpiry <= EXPIRY_WARNING_DAYS ? (
            <NSPlanExpiryBanner
              tenantSlug={tenantSlug}
              daysUntilExpiry={planStatus.daysUntilExpiry}
              expiresAt={planStatus.expiresAt}
            />
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
