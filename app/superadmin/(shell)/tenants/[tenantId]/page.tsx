import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantSummaryById } from "@/lib/repositories/superadmin-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { updateTenantStatusAction, impersonateTenantAction } from "@/app/superadmin/actions";
import { NSTenantStatusBadge } from "@/components/superadmin/NSTenantStatusBadge";
import { NSButton } from "@/components/ui/NSButton";
import { NSLogo } from "@/components/brand/NSLogo";
import type { TenantStatus } from "@/lib/types/tenant";

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

  const settings = await getSettings(tenant.id);

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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Productos" value={tenant.counts.products} />
        <Stat label="Categorías" value={tenant.counts.categories} />
        <Stat label="Pedidos" value={tenant.counts.orders} />
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
        <h2 className="font-display text-lg uppercase tracking-wide">Información general</h2>
        <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 rounded-card border border-border p-5 text-sm sm:grid-cols-2">
          <Field label="Correo de contacto" value={settings.contactEmail || "—"} />
          <Field label="WhatsApp" value={settings.whatsappDisplay || settings.whatsappNumber || "—"} />
          <Field label="Descripción" value={settings.brandDescription || "—"} />
          <Field label="Creado" value={new Date(tenant.createdAt).toLocaleString("es")} />
        </dl>
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
