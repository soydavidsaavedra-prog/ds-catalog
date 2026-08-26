import type { Metadata } from "next";
import Link from "next/link";
import { listAllTenantsWithCounts, derivePlatformKpis } from "@/lib/repositories/superadmin-repository";
import { listSubscriptionsWithDetails, listPendingPlanChangeRequests } from "@/lib/repositories/subscriptions-repository";
import { listPlans } from "@/lib/repositories/plans-repository";

export const metadata: Metadata = {
  title: "Dashboard",
};

function KpiCard({ label, value, tone }: { label: string; value: string | number; tone?: "danger" | "warning" }) {
  const color = tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-card border border-border bg-surface-elevated p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl ${color}`}>{value}</p>
    </div>
  );
}

export default async function SuperadminDashboardPage() {
  const [tenants, subscriptions, planChangeRequests, plans] = await Promise.all([
    listAllTenantsWithCounts(),
    listSubscriptionsWithDetails(),
    listPendingPlanChangeRequests(),
    listPlans(),
  ]);
  const kpis = derivePlatformKpis(tenants);
  const planById = new Map(plans.map((p) => [p.id, p]));

  const attentionTenants = tenants.filter(
    (t) => t.status === "active" && t.counts.products === 0 && t.onboardingCompleted,
  );
  const pendingSubscriptions = subscriptions.filter((s) => s.status === "pending");
  const deletionRequests = tenants.filter((t) => t.deletionRequestedAt);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vista general de toda la plataforma DS Catalog.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Clientes" value={kpis.totalTenants} />
        <KpiCard
          label="Pendientes de aprobar"
          value={pendingSubscriptions.length}
          tone={pendingSubscriptions.length > 0 ? "warning" : undefined}
        />
        <KpiCard label="Activos" value={kpis.activeTenants} />
        <KpiCard label="Pausados" value={kpis.pausedTenants} tone={kpis.pausedTenants > 0 ? "warning" : undefined} />
        <KpiCard
          label="Suspendidos"
          value={kpis.suspendedTenants}
          tone={kpis.suspendedTenants > 0 ? "danger" : undefined}
        />
        <KpiCard label="Productos" value={kpis.totalProducts.toLocaleString("es")} />
        <KpiCard label="Categorías" value={kpis.totalCategories.toLocaleString("es")} />
        <KpiCard label="Pedidos" value={kpis.totalOrders.toLocaleString("es")} />
        <KpiCard label="Archivados" value={kpis.archivedTenants} />
      </div>

      <div>
        <h2 className="font-display text-lg uppercase tracking-wide">Solicitudes pendientes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clientes que ya se registraron y eligieron un plan — actívalos desde su ficha para que puedan entrar.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {pendingSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay solicitudes esperando aprobación.</p>
          ) : (
            pendingSubscriptions.map((s) => (
              <Link
                key={s.id}
                href={`/superadmin/tenants/${s.tenantId}`}
                className="flex items-center justify-between gap-2 rounded-control border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning hover:border-warning/60"
              >
                <span>{s.tenantName}</span>
                <span className="text-xs uppercase tracking-wide">Eligió: {s.plan?.name ?? "—"}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {planChangeRequests.length > 0 ? (
        <div>
          <h2 className="font-display text-lg uppercase tracking-wide">Cambios de plan solicitados</h2>
          <div className="mt-3 flex flex-col gap-2">
            {planChangeRequests.map((r) => (
              <Link
                key={r.tenantId}
                href={`/superadmin/tenants/${r.tenantId}`}
                className="flex items-center justify-between gap-2 rounded-control border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning hover:border-warning/60"
              >
                <span>{r.tenantName}</span>
                <span className="text-xs uppercase tracking-wide">
                  {planById.get(r.planId)?.name ?? "—"} → {planById.get(r.requestedPlanId)?.name ?? "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {deletionRequests.length > 0 ? (
        <div>
          <h2 className="font-display text-lg uppercase tracking-wide">Solicitudes de eliminación de cuenta</h2>
          <div className="mt-3 flex flex-col gap-2">
            {deletionRequests.map((t) => (
              <Link
                key={t.id}
                href={`/superadmin/tenants/${t.id}`}
                className="flex items-center justify-between gap-2 rounded-control border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger hover:border-danger/60"
              >
                <span>{t.name}</span>
                <span className="text-xs uppercase tracking-wide">
                  {new Date(t.deletionRequestedAt as string).toLocaleDateString("es")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="font-display text-lg uppercase tracking-wide">Alertas</h2>
        <div className="mt-3 flex flex-col gap-2">
          {attentionTenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin alertas por ahora.</p>
          ) : (
            attentionTenants.map((t) => (
              <Link
                key={t.id}
                href={`/superadmin/tenants/${t.id}`}
                className="flex items-center gap-2 rounded-control border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning hover:border-warning/60"
              >
                ⚠️ {t.name} está activo pero no tiene productos cargados
              </Link>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg uppercase tracking-wide">Clientes recientes</h2>
          <Link href="/superadmin/tenants" className="text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <tbody>
              {tenants.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/superadmin/tenants/${t.id}`} className="font-medium hover:text-accent-strong">
                      {t.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">/{t.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-foreground">
                    {t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
