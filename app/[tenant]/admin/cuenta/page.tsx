import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getAppUserByTenantId } from "@/lib/repositories/app-users-repository";
import { getSubscriptionByTenantId } from "@/lib/repositories/subscriptions-repository";
import { listPlans } from "@/lib/repositories/plans-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { logoutAction } from "@/app/[tenant]/admin/actions";
import { NSAccountPlanCard } from "@/components/admin/NSAccountPlanCard";
import { NSAccountEmailForm } from "@/components/admin/NSAccountEmailForm";
import { NSAccountPasswordForm } from "@/components/admin/NSAccountPasswordForm";
import { NSAccountDangerZone } from "@/components/admin/NSAccountDangerZone";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { NSButton } from "@/components/ui/NSButton";

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

  const [appUser, subscription, plans, products] = await Promise.all([
    getAppUserByTenantId(tenant.id),
    getSubscriptionByTenantId(tenant.id),
    listPlans(),
    listProducts(tenant.id),
  ]);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <DSPageHeader
        title="Mi cuenta"
        description="Tu plan, tu correo de acceso y tu contraseña — separado de Configuración, que es sobre tu catálogo."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {appUser ? (
            <DSCard title="Perfil">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-accent/15 font-display text-lg text-accent-strong">
                  {appUser.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{appUser.email}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Propietario</p>
                </div>
              </div>
            </DSCard>
          ) : null}

          <DSCard title="Seguridad" description="Tu acceso al panel administrativo.">
            <div className="flex flex-col gap-6">
              {appUser ? (
                <>
                  <NSAccountEmailForm tenantId={tenant.id} tenantSlug={tenantSlug} currentEmail={appUser.email} />
                  <div className="border-t border-border pt-6">
                    <NSAccountPasswordForm tenantId={tenant.id} tenantSlug={tenantSlug} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tu cuenta todavía no tiene un correo de acceso asignado — contáctanos para configurarlo.
                </p>
              )}
              <div className="flex items-center justify-between border-t border-border pt-6">
                <div>
                  <p className="text-sm font-medium text-foreground">Sesión activa</p>
                  <p className="text-xs text-muted-foreground">Este dispositivo tiene una sesión iniciada.</p>
                </div>
                <form action={logoutAction.bind(null, tenantSlug)}>
                  <NSButton type="submit" variant="outline" size="sm">
                    Cerrar sesión
                  </NSButton>
                </form>
              </div>
            </div>
          </DSCard>
        </div>

        <div className="flex flex-col gap-6">
          <NSAccountPlanCard
            tenantId={tenant.id}
            tenantSlug={tenantSlug}
            subscription={subscription}
            plans={plans}
            productsUsed={products.length}
          />

          <DSCard title="Catálogo">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">{tenant.name}</p>
              <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
            </div>
            <NSButton
              href={`/${tenantSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
              className="mt-4 w-full justify-center"
            >
              Ver catálogo público ↗
            </NSButton>
          </DSCard>
        </div>
      </div>

      <NSAccountDangerZone tenantId={tenant.id} tenantSlug={tenantSlug} deletionRequestedAt={tenant.deletionRequestedAt} />
    </div>
  );
}
