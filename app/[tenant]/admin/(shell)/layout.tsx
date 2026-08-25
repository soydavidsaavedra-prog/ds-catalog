import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { isAdminAuthenticated, isImpersonatedSession } from "@/lib/auth/admin-auth";
import { getSettings } from "@/lib/repositories/settings-repository";
import { isSubscriptionFrozen } from "@/lib/tenant/plan-limits";
import { NSAdminSidebar } from "@/components/admin/NSAdminSidebar";

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
  // The tenant's own session is frozen out the moment its plan expires —
  // but a Super Admin impersonating in to fix things (renew the plan,
  // check on the account) must still get through. See
  // lib/tenant/plan-limits.ts isSubscriptionFrozen.
  if (!impersonating && (await isSubscriptionFrozen(tenant.id))) {
    redirect(`/${tenantSlug}/admin/suspended`);
  }
  const settings = await getSettings(tenant.id);

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <NSAdminSidebar
        tenantSlug={tenantSlug}
        logoSrc={settings.brandLogo}
        brandName={settings.brandName}
        tagline={settings.heroSubtitle}
        impersonating={impersonating}
      />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
