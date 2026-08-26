import type { Metadata } from "next";
import Link from "next/link";
import { listAllTenantsWithCounts, derivePlatformKpis } from "@/lib/repositories/superadmin-repository";
import { listSubscriptionsWithDetails, listPendingPlanChangeRequests } from "@/lib/repositories/subscriptions-repository";
import { listPlans } from "@/lib/repositories/plans-repository";
import { getStorageUsageByTenant, deriveGlobalStorageUsage } from "@/lib/repositories/storage-repository";
import { formatBytes } from "@/lib/utils/format";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSStatCard } from "@/components/ui/DSStatCard";
import { DSActivityRow } from "@/components/ui/DSActivityRow";
import { NSReveal } from "@/components/ui/NSReveal";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function SuperadminDashboardPage() {
  const [tenants, subscriptions, planChangeRequests, plans, storageUsage] = await Promise.all([
    listAllTenantsWithCounts(),
    listSubscriptionsWithDetails(),
    listPendingPlanChangeRequests(),
    listPlans(),
    getStorageUsageByTenant(),
  ]);
  const kpis = derivePlatformKpis(tenants);
  const globalStorage = deriveGlobalStorageUsage(storageUsage);
  const planById = new Map(plans.map((p) => [p.id, p]));

  const attentionTenants = tenants.filter(
    (t) => t.status === "active" && t.counts.products === 0 && t.onboardingCompleted,
  );
  const pendingSubscriptions = subscriptions.filter((s) => s.status === "pending");
  const deletionRequests = tenants.filter((t) => t.deletionRequestedAt);
  const needsAttentionCount = pendingSubscriptions.length + planChangeRequests.length + deletionRequests.length + attentionTenants.length;

  return (
    <div className="flex flex-col gap-8">
      <DSPageHeader
        eyebrow="Plataforma"
        title="Dashboard"
        description="Vista general de toda la plataforma DS Catalog."
      />

      <NSReveal y={12}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <DSStatCard label="Clientes" value={kpis.totalTenants} href="/superadmin/tenants" />
          <DSStatCard
            label="Pendientes de aprobar"
            value={pendingSubscriptions.length}
            tone={pendingSubscriptions.length > 0 ? "warning" : "default"}
            href="/superadmin/subscriptions"
          />
          <DSStatCard label="Activos" value={kpis.activeTenants} tone="success" href="/superadmin/tenants" />
          <DSStatCard label="Pausados" value={kpis.pausedTenants} tone={kpis.pausedTenants > 0 ? "warning" : "default"} href="/superadmin/tenants" />
          <DSStatCard
            label="Suspendidos"
            value={kpis.suspendedTenants}
            tone={kpis.suspendedTenants > 0 ? "danger" : "default"}
            href="/superadmin/tenants"
          />
          <DSStatCard label="Productos" value={kpis.totalProducts.toLocaleString("es")} />
          <DSStatCard label="Categorías" value={kpis.totalCategories.toLocaleString("es")} />
          <DSStatCard label="Pedidos" value={kpis.totalOrders.toLocaleString("es")} />
          <DSStatCard label="Archivados" value={kpis.archivedTenants} href="/superadmin/tenants" />
          <DSStatCard label="Storage" value={formatBytes(globalStorage.totalBytes)} href="/superadmin/storage" hint={`${globalStorage.totalFiles.toLocaleString("es")} archivos`} />
        </div>
      </NSReveal>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface-elevated lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-lg uppercase tracking-wide">Requiere tu atención</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Solicitudes de clientes y cuentas activas que necesitan una acción tuya.
            </p>
          </div>
          {needsAttentionCount === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <CheckIcon className="h-8 w-8 text-success/60" />
              <p className="text-sm font-medium text-foreground">Todo al día</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                No hay solicitudes pendientes ni cuentas que necesiten revisión ahora mismo.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 p-4">
              {pendingSubscriptions.length > 0 ? (
                <AttentionGroup label="Pendientes de aprobar">
                  {pendingSubscriptions.map((s) => (
                    <DSActivityRow
                      key={s.id}
                      icon={<ClockIcon className="h-4 w-4" />}
                      title={s.tenantName}
                      meta={`Eligió: ${s.plan?.name ?? "—"}`}
                      href={`/superadmin/tenants/${s.tenantId}`}
                      tone="warning"
                    />
                  ))}
                </AttentionGroup>
              ) : null}

              {planChangeRequests.length > 0 ? (
                <AttentionGroup label="Cambios de plan solicitados">
                  {planChangeRequests.map((r) => (
                    <DSActivityRow
                      key={r.tenantId}
                      icon={<PlanIcon className="h-4 w-4" />}
                      title={r.tenantName}
                      meta={`${planById.get(r.planId)?.name ?? "—"} → ${planById.get(r.requestedPlanId)?.name ?? "—"}`}
                      href={`/superadmin/tenants/${r.tenantId}`}
                      tone="warning"
                    />
                  ))}
                </AttentionGroup>
              ) : null}

              {deletionRequests.length > 0 ? (
                <AttentionGroup label="Solicitudes de eliminación de cuenta">
                  {deletionRequests.map((t) => (
                    <DSActivityRow
                      key={t.id}
                      icon={<TrashIcon className="h-4 w-4" />}
                      title={t.name}
                      meta={new Date(t.deletionRequestedAt as string).toLocaleDateString("es")}
                      href={`/superadmin/tenants/${t.id}`}
                      tone="danger"
                    />
                  ))}
                </AttentionGroup>
              ) : null}

              {attentionTenants.length > 0 ? (
                <AttentionGroup label="Activos sin productos">
                  {attentionTenants.map((t) => (
                    <DSActivityRow
                      key={t.id}
                      icon={<WarningIcon className="h-4 w-4" />}
                      title={`${t.name} está activo pero no tiene productos cargados`}
                      href={`/superadmin/tenants/${t.id}`}
                      tone="warning"
                    />
                  ))}
                </AttentionGroup>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-card border border-border bg-surface-elevated">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-lg uppercase tracking-wide">Clientes recientes</h2>
            <Link href="/superadmin/tenants" className="text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {tenants.slice(0, 6).map((t) => (
              <DSActivityRow
                key={t.id}
                title={t.name}
                meta={t.status}
                href={`/superadmin/tenants/${t.id}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttentionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">{label}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function iconProps() {
  return { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
}
function ClockIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></svg>;
}
function PlanIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M3 6l7-3.5L17 6v8l-7 3.5L3 14V6Z" /><path d="M3 6l7 3.5L17 6M10 9.5V17" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M4 6h12M8 6V4h4v2M6 6l.6 10a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L14 6" /></svg>;
}
function WarningIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M10 3 2.5 16h15L10 3Z" /><path d="M10 8.5v3.5" /><circle cx="10" cy="14.5" r="0.5" fill="currentColor" stroke="none" /></svg>;
}
function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><circle cx="10" cy="10" r="7.5" /><path d="M6.5 10.2l2.3 2.3 4.7-5" /></svg>;
}
