"use client";

import { useMemo, useState } from "react";
import type { AppUser } from "@/lib/repositories/app-users-repository";
import type { Subscription } from "@/lib/repositories/subscriptions-repository";
import type { Plan } from "@/lib/repositories/plans-repository";
import type { Product } from "@/lib/types/catalog";
import type { Order } from "@/lib/types/order";
import type { TenantStatus } from "@/lib/types/tenant";
import { logoutAction } from "@/app/[tenant]/admin/actions";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { DSActivityRow } from "@/components/ui/DSActivityRow";
import { NSButton } from "@/components/ui/NSButton";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSReveal } from "@/components/ui/NSReveal";
import { NSTenantStatusBadge } from "@/components/superadmin/NSTenantStatusBadge";
import { NSAccountPlanCard } from "@/components/admin/NSAccountPlanCard";
import { NSAccountEmailForm } from "@/components/admin/NSAccountEmailForm";
import { NSAccountPasswordForm } from "@/components/admin/NSAccountPasswordForm";
import { NSAccountDangerZone } from "@/components/admin/NSAccountDangerZone";
import { NSCatalogShareButtons } from "@/components/admin/NSCatalogShareButtons";
import { formatPrice } from "@/lib/utils/format";

type ActivityEntry = { kind: "order"; at: string; order: Order } | { kind: "product"; at: string; product: Product };

export function NSAccountCenter({
  tenantId,
  tenantSlug,
  tenantName,
  tenantStatus,
  deletionRequestedAt,
  appUser,
  subscription,
  plans,
  productsUsed,
  products,
  orders,
  brandName,
  catalogPreviewImage,
  publicUrl,
}: {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tenantStatus: TenantStatus;
  deletionRequestedAt: string | null;
  appUser: AppUser | null;
  subscription: Subscription | null;
  plans: Plan[];
  productsUsed: number;
  products: Product[];
  orders: Order[];
  brandName: string;
  catalogPreviewImage?: string;
  publicUrl: string;
}) {
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  const currentPlan = subscription ? plans.find((p) => p.id === subscription.planId) : null;

  const activity: ActivityEntry[] = useMemo(
    () =>
      [
        ...orders.map((order): ActivityEntry => ({ kind: "order", at: order.createdAt, order })),
        ...products.map((product): ActivityEntry => ({ kind: "product", at: product.createdAt, product })),
      ]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 5),
    [orders, products],
  );

  return (
    <div className="flex flex-col gap-8">
      <DSPageHeader title="Mi cuenta" description="Gestiona tu perfil, seguridad, plan y acceso a tu catálogo." />

      {/* Account overview — three equal tiles, each a teaser for the detailed section below it. */}
      <NSReveal y={12}>
        <div className="grid gap-5 md:grid-cols-3">
          <DSCard>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-accent/15 font-display text-base text-accent-strong">
                {(appUser?.email ?? tenantName).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Perfil</p>
                <p className="truncate text-sm font-semibold text-foreground">{appUser?.email ?? "Sin correo asignado"}</p>
                <p className="text-xs text-muted-foreground">Propietario</p>
              </div>
            </div>
            <a href="#seguridad" className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline">
              Editar perfil →
            </a>
          </DSCard>

          <DSCard>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Plan</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="font-display text-lg">{currentPlan?.name ?? "Sin plan"}</p>
              {subscription ? (
                <span className="text-xs text-muted-foreground">
                  {productsUsed}
                  {currentPlan?.maxProducts ? ` / ${currentPlan.maxProducts}` : ""} productos
                </span>
              ) : null}
            </div>
            <a href="#plan-uso" className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline">
              Ver mi plan →
            </a>
          </DSCard>

          <DSCard>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Catálogo</p>
              <NSTenantStatusBadge status={tenantStatus} />
            </div>
            <p className="mt-1 truncate font-display text-lg">{tenantName}</p>
            <p className="text-xs text-muted-foreground">/{tenantSlug}</p>
            <NSButton
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
              className="mt-4 w-full justify-center"
            >
              Abrir catálogo ↗
            </NSButton>
          </DSCard>
        </div>
      </NSReveal>

      {/* Seguridad de la cuenta */}
      <div id="seguridad">
      <DSCard
        title="Seguridad de la cuenta"
        description="Administra las credenciales y mecanismos de protección de tu cuenta."
      >
        <div className="flex flex-col divide-y divide-border">
          {appUser ? (
            <>
              <SettingRow
                label="Correo de acceso"
                value={appUser.email}
                actionLabel={editingEmail ? "Cerrar" : "Cambiar"}
                onToggle={() => setEditingEmail((v) => !v)}
              >
                {editingEmail ? (
                  <div className="pb-1">
                    <NSAccountEmailForm tenantId={tenantId} tenantSlug={tenantSlug} currentEmail={appUser.email} />
                  </div>
                ) : null}
              </SettingRow>

              <SettingRow
                label="Contraseña"
                value="••••••••"
                actionLabel={editingPassword ? "Cerrar" : "Cambiar"}
                onToggle={() => setEditingPassword((v) => !v)}
              >
                {editingPassword ? (
                  <div className="pb-1">
                    <NSAccountPasswordForm tenantId={tenantId} tenantSlug={tenantSlug} />
                  </div>
                ) : null}
              </SettingRow>
            </>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              Tu cuenta todavía no tiene un correo de acceso asignado — contáctanos para configurarlo.
            </p>
          )}

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-foreground">Sesión activa</p>
              <p className="text-xs text-muted-foreground">Este dispositivo tiene una sesión iniciada ahora mismo.</p>
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

      {/* Plan y uso — detailed commercial info, no infrastructure metrics. */}
      <div id="plan-uso">
        <NSAccountPlanCard tenantId={tenantId} tenantSlug={tenantSlug} subscription={subscription} plans={plans} productsUsed={productsUsed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DSCard title="Mi catálogo" className="lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="h-32 w-full shrink-0 overflow-hidden rounded-control sm:w-48">
              <NSMedia src={catalogPreviewImage} alt={brandName} sizes="192px" brandName={brandName} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div>
                <p className="font-display text-lg">{tenantName}</p>
                <p className="text-xs text-muted-foreground">/{tenantSlug}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{publicUrl}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <NSButton href={publicUrl} target="_blank" rel="noopener noreferrer" size="sm">
                  Abrir catálogo público ↗
                </NSButton>
                <NSCatalogShareButtons url={publicUrl} title={tenantName} />
              </div>
            </div>
          </div>
        </DSCard>

        <DSCard title="Actividad reciente">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay actividad — en cuanto agregues productos o lleguen pedidos, los vas a ver aquí.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activity.map((entry) =>
                entry.kind === "order" ? (
                  <DSActivityRow
                    key={`order-${entry.order.id}`}
                    title={`Pedido — ${formatPrice(entry.order.total)}`}
                    meta={new Date(entry.order.createdAt).toLocaleDateString("es-VE")}
                    href={`/${tenantSlug}/admin/pedidos`}
                  />
                ) : (
                  <DSActivityRow
                    key={`product-${entry.product.id}`}
                    title={`Producto agregado: ${entry.product.name}`}
                    meta={new Date(entry.product.createdAt).toLocaleDateString("es-VE")}
                    href={`/${tenantSlug}/admin/productos/${entry.product.id}`}
                  />
                ),
              )}
            </div>
          )}
        </DSCard>
      </div>

      <NSAccountDangerZone tenantId={tenantId} tenantSlug={tenantSlug} deletionRequestedAt={deletionRequestedAt} />
    </div>
  );
}

function SettingRow({
  label,
  value,
  actionLabel,
  onToggle,
  children,
}: {
  label: string;
  value: string;
  actionLabel: string;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{value}</p>
        </div>
        <NSButton type="button" variant="outline" size="sm" onClick={onToggle}>
          {actionLabel}
        </NSButton>
      </div>
      {children}
    </div>
  );
}
