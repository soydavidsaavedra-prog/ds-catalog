import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { isSubscriptionFrozen } from "@/lib/tenant/plan-limits";
import { getSettings } from "@/lib/repositories/settings-repository";
import { NSLogo } from "@/components/brand/NSLogo";
import { logoutAction } from "@/app/[tenant]/admin/actions";

export const metadata: Metadata = {
  title: "Cuenta suspendida",
  robots: { index: false, follow: false },
};

export default async function AdminSuspendedPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  if (!(await isAdminAuthenticated(tenantSlug))) {
    redirect("/acceder");
  }
  // Redirect back to the normal panel the moment it's no longer frozen —
  // this page isn't where a healthy account should land.
  if (!(await isSubscriptionFrozen(tenant.id))) {
    redirect(`/${tenantSlug}/admin`);
  }
  const settings = await getSettings(tenant.id);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-4 text-center text-ink-0">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <NSLogo
            id="ns-suspended"
            variant="mark"
            className="h-14 w-14"
            src={settings.brandLogo}
            brandName={settings.brandName}
            tagline={settings.heroSubtitle}
          />
        </div>
        <div className="rounded-card border border-warning/30 bg-warning/10 p-6">
          <p className="font-display text-lg uppercase tracking-wide text-warning">Cuenta suspendida</p>
          <p className="mt-2 text-sm text-ink-300">
            Tu plan venció. Tu catálogo público y tu panel quedaron en pausa hasta que se renueve. Contáctanos para
            reactivarlo.
          </p>
        </div>
        <form action={logoutAction} className="mt-6">
          <button type="submit" className="text-xs font-medium text-ink-400 hover:text-ink-0">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
