import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getAppUserByTenantId } from "@/lib/repositories/app-users-repository";
import { getSubscriptionByTenantId } from "@/lib/repositories/subscriptions-repository";
import { listPlans } from "@/lib/repositories/plans-repository";
import { NSAccountPlanCard } from "@/components/admin/NSAccountPlanCard";
import { NSAccountEmailForm } from "@/components/admin/NSAccountEmailForm";
import { NSAccountPasswordForm } from "@/components/admin/NSAccountPasswordForm";
import { NSAccountDangerZone } from "@/components/admin/NSAccountDangerZone";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function AdminAccountPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  const [appUser, subscription, plans] = await Promise.all([
    getAppUserByTenantId(tenant.id),
    getSubscriptionByTenantId(tenant.id),
    listPlans(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Mi cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu plan, tu correo de acceso y tu contraseña — separado de Configuración, que es sobre tu catálogo.
        </p>
      </div>

      <NSAccountPlanCard tenantId={tenant.id} tenantSlug={tenantSlug} subscription={subscription} plans={plans} />

      {appUser ? (
        <>
          <NSAccountEmailForm tenantId={tenant.id} tenantSlug={tenantSlug} currentEmail={appUser.email} />
          <NSAccountPasswordForm tenantId={tenant.id} tenantSlug={tenantSlug} />
        </>
      ) : (
        <div className="rounded-card border border-border bg-surface-elevated p-5 text-sm text-muted-foreground">
          Tu cuenta todavía no tiene un correo de acceso asignado — contáctanos para configurarlo.
        </div>
      )}

      <NSAccountDangerZone tenantId={tenant.id} tenantSlug={tenantSlug} deletionRequestedAt={tenant.deletionRequestedAt} />
    </div>
  );
}
