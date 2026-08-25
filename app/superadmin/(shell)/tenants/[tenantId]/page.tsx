import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantSummaryById } from "@/lib/repositories/superadmin-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { listPlans } from "@/lib/repositories/plans-repository";
import { getSubscriptionByTenantId } from "@/lib/repositories/subscriptions-repository";
import { getStorageUsageForSlug } from "@/lib/repositories/storage-repository";
import { formatBytes } from "@/lib/utils/format";
import {
  updateTenantStatusAction,
  updateTenantBusinessTypeAction,
  impersonateTenantAction,
  assignPlanAction,
  updateSubscriptionStatusAction,
} from "@/app/superadmin/actions";
import { NSTenantStatusBadge } from "@/components/superadmin/NSTenantStatusBadge";
import { NSDeleteTenantForm } from "@/components/superadmin/NSDeleteTenantForm";
import { NSButton } from "@/components/ui/NSButton";
import { NSLabel, NSSelect, NSInput } from "@/components/ui/NSInput";
import { NSLogo } from "@/components/brand/NSLogo";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/tenant/business-type";
import type { TenantStatus } from "@/lib/types/tenant";
import type { SubscriptionStatus } from "@/lib/repositories/subscriptions-repository";

export const metadata: Metadata = {
  title: "Cliente",
};

const STATUS_ACTIONS: { status: TenantStatus; label: string; variant: "primary" | "outline" }[] = [
  { status: "active", label: "Activar", variant: "primary" },
  { status: "paused", label: "Pausar", variant: "outline" },
  { status: "suspended", label: "Suspender", variant: "outline" },
  { status: "archived", label: "Archivar", variant: "outline" },
];

export default async function SuperadminTenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantSummaryById(tenantId);
  if (!tenant) notFound();

  const [settings, plans, subscription, storage] = await Promise.all([
    getSettings(tenant.id),
    listPlans(),
    getSubscriptionByTenantId(tenant.id),
    getStorageUsageForSlug(tenant.slug),
  ]);
  const currentPlan = subscription ? plans.find((p) => p.id === subscription.planId) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <NSLogo
            id={`superadmin-tenant-${tenant.id}`}
            variant="mark"
            className="h-12 w-12"
            src={settings.brandLogo}
            brandName={settings.brandName}
            tagline={settings.heroSubtitle}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl uppercase tracking-wide">{tenant.name}</h1>
              <NSTenantStatusBadge status={tenant.status} />
            </div>
            <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${tenant.slug}`} target="_blank">
            <NSButton variant="outline">Ver catálogo</NSButton>
          </Link>
          <form action={impersonateTenantAction.bind(null, tenant.id)}>
            <NSButton type="submit">Administrar catálogo</NSButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Stat label="Productos" value={tenant.counts.products} />
        <Stat label="Categorías" value={tenant.counts.categories} />
        <Stat label="Pedidos" value={tenant.counts.orders} />
        <Stat label="Storage" value={formatBytes(storage.totalBytes)} />
        <Stat label="Onboarding" value={tenant.onboardingCompleted ? "Completo" : "Pendiente"} />
      </div>

      <div>
        <h2 className="font-display text-lg uppercase tracking-wide">Estado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cambiar el estado no borra ningún dato — solo controla si el catálogo público es accesible.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_ACTIONS.map((action) => (
            <form key={action.status} action={updateTenantStatusAction.bind(null, tenant.id, action.status)}>
              <NSButton type="submit" variant={tenant.status === action.status ? "primary" : "outline"} size="sm">
                {action.label}
              </NSButton>
            </form>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg uppercase tracking-wide">Tipo de negocio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define qué campos ve el cliente en su formulario de productos (tallas, colores). No toca productos ni
          categorías ya creados.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BUSINESS_TYPE_OPTIONS.map((profile) => (
            <form key={profile.value} action={updateTenantBusinessTypeAction.bind(null, tenant.id, profile.value)}>
              <NSButton
                type="submit"
                variant={tenant.businessType === profile.value ? "primary" : "outline"}
                size="sm"
              >
                {profile.label}
              </NSButton>
            </form>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg uppercase tracking-wide">Plan y suscripción</h2>
        {subscription ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-card border border-border p-5 text-sm">
            <div className="flex-1">
              <p className="font-display text-lg">{currentPlan?.name ?? "Plan eliminado"}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {subscription.status} · vence{" "}
                {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString("es") : "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["active", "trial", "paused", "expired", "cancelled"] as SubscriptionStatus[]).map((s) => (
                <form key={s} action={updateSubscriptionStatusAction.bind(null, tenant.id, s)}>
                  <NSButton type="submit" variant={subscription.status === s ? "primary" : "outline"} size="sm">
                    {s}
                  </NSButton>
                </form>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Sin plan asignado — el cliente sigue activo e ilimitado.</p>
        )}

        <form action={assignPlanAction.bind(null, tenant.id)} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <NSLabel htmlFor="planId">{subscription ? "Cambiar plan" : "Asignar plan"}</NSLabel>
            <NSSelect id="planId" name="planId" defaultValue={subscription?.planId ?? ""} required className="w-48">
              <option value="" disabled>
                Elige un plan
              </option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NSSelect>
          </div>
          <div>
            <NSLabel htmlFor="status">Estado</NSLabel>
            <NSSelect id="status" name="status" defaultValue="trial" className="w-36">
              <option value="trial">trial</option>
              <option value="active">active</option>
              <option value="paused">paused</option>
            </NSSelect>
          </div>
          <div>
            <NSLabel htmlFor="expiresAt">Vence</NSLabel>
            <NSInput id="expiresAt" name="expiresAt" type="date" />
          </div>
          <NSButton type="submit">{subscription ? "Actualizar" : "Asignar"}</NSButton>
        </form>
      </div>

      <div>
        <h2 className="font-display text-lg uppercase tracking-wide">Información general</h2>
        <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 rounded-card border border-border p-5 text-sm sm:grid-cols-2">
          <Field label="Correo de contacto" value={settings.contactEmail || "—"} />
          <Field label="WhatsApp" value={settings.whatsappDisplay || settings.whatsappNumber || "—"} />
          <Field label="Descripción" value={settings.brandDescription || "—"} />
          <Field label="Creado" value={new Date(tenant.createdAt).toLocaleString("es")} />
        </dl>
      </div>

      <div className="rounded-card border border-danger/30 p-5">
        <h2 className="font-display text-lg uppercase tracking-wide text-danger">Zona de peligro</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elimina permanentemente este cliente: su catálogo, pedidos, configuración y todos sus archivos en Supabase
          Storage. Irreversible.
        </p>
        <div className="mt-4">
          <NSDeleteTenantForm tenantId={tenant.id} tenantSlug={tenant.slug} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-surface-elevated p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
