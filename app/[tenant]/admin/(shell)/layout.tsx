import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { isAdminAuthenticated, isImpersonatedSession } from "@/lib/auth/admin-auth";
import { getSettings } from "@/lib/repositories/settings-repository";
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
    redirect(`/${tenantSlug}/admin/login`);
  }
  const settings = await getSettings(tenant.id);
  const impersonating = await isImpersonatedSession();

  return (
    <div className="flex min-h-dvh bg-surface">
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
