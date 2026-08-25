import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { NSOnboardingWizard } from "@/components/admin/NSOnboardingWizard";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";

export const metadata: Metadata = {
  title: "Bienvenida",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  if (!(await isAdminAuthenticated(tenantSlug))) {
    redirect("/acceder");
  }
  if (tenant.onboardingCompleted) {
    redirect(`/${tenantSlug}/admin`);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-4 py-16 text-ink-0">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <DSPlatformMark className="h-14 w-14" />
          <p className="font-display text-xl uppercase tracking-wide">¡Bienvenido, {tenant.name}!</p>
          <p className="text-xs text-ink-400">Un par de datos y tu catálogo estará listo.</p>
        </div>
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6">
          <NSOnboardingWizard tenantId={tenant.id} tenantSlug={tenantSlug} />
        </div>
      </div>
    </div>
  );
}
