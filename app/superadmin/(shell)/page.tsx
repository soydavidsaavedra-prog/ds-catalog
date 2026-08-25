import type { Metadata } from "next";
import Link from "next/link";
import { listAllTenantsWithCounts, derivePlatformKpis } from "@/lib/repositories/superadmin-repository";

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
  const tenants = await listAllTenantsWithCounts();
  const kpis = derivePlatformKpis(tenants);

  const attentionTenants = tenants.filter(
    (t) => t.status === "active" && t.counts.products === 0 && t.onboardingCompleted,
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vista general de toda la plataforma DS Catalog.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Clientes" value={kpis.totalTenants} />
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
