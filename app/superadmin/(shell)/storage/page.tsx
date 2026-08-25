import type { Metadata } from "next";
import Link from "next/link";
import {
  getStorageUsageByTenant,
  deriveGlobalStorageUsage,
  getDatabaseSizeBytes,
} from "@/lib/repositories/storage-repository";
import { listSubscriptionsWithDetails } from "@/lib/repositories/subscriptions-repository";
import { listPlans } from "@/lib/repositories/plans-repository";
import { formatBytes } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Storage",
};

export default async function SuperadminStoragePage() {
  const [usage, databaseSizeBytes, subscriptions, plans] = await Promise.all([
    getStorageUsageByTenant(),
    getDatabaseSizeBytes(),
    listSubscriptionsWithDetails(),
    listPlans(),
  ]);
  const global = deriveGlobalStorageUsage(usage);
  const maxTenantBytes = Math.max(1, ...usage.map((u) => u.totalBytes));

  const planByTenantId = new Map(subscriptions.map((s) => [s.tenantId, s.plan]));
  const planLimitMb = new Map(plans.map((p) => [p.id, p.maxStorageMb]));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Storage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calculado en vivo desde el bucket <code>ns-product-images</code> — sin cifras guardadas ni estimadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-border bg-surface-elevated p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Storage global</p>
          <p className="mt-2 font-display text-3xl">{formatBytes(global.totalBytes)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {global.totalFiles.toLocaleString("es")} archivos · límite del plan de Supabase no disponible desde la
            app (requiere la API de administración de Supabase)
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface-elevated p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Base de datos</p>
          <p className="mt-2 font-display text-3xl">
            {databaseSizeBytes !== null ? formatBytes(databaseSizeBytes) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {databaseSizeBytes !== null
              ? "Tamaño real de Postgres (pg_database_size)"
              : "No disponible — corre el bloque \"database size RPC\" de supabase/schema.sql"}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface-elevated p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Egress</p>
          <p className="mt-2 font-display text-3xl text-muted-foreground">—</p>
          <p className="mt-1 text-xs text-muted-foreground">No disponible sin la API de administración de Supabase.</p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg uppercase tracking-wide">Consumo por cliente</h2>
        <div className="mt-3 flex flex-col gap-3">
          {usage.map((u) => {
            const plan = planByTenantId.get(u.tenantId);
            const limitMb = plan ? planLimitMb.get(plan.id) : undefined;
            const usedMb = u.totalBytes / (1024 * 1024);
            const percentOfPlan = limitMb ? Math.min(100, (usedMb / limitMb) * 100) : null;
            const nearLimit = percentOfPlan !== null && percentOfPlan >= 80;

            return (
              <div key={u.tenantId} className="rounded-card border border-border p-4">
                <div className="flex items-center justify-between text-sm">
                  <Link href={`/superadmin/tenants/${u.tenantId}`} className="font-medium hover:text-accent-strong">
                    {u.tenantName}
                  </Link>
                  <span className="text-muted-foreground">
                    {formatBytes(u.totalBytes)}
                    {limitMb ? ` / ${limitMb} MB` : ""} · {u.fileCount} archivos
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-surface">
                  <div
                    className={`h-full rounded-pill ${nearLimit ? "bg-danger" : "bg-accent"}`}
                    style={{
                      width: `${Math.max(2, (u.totalBytes / maxTenantBytes) * 100)}%`,
                    }}
                  />
                </div>
                {nearLimit ? (
                  <p className="mt-1.5 text-xs font-semibold text-danger">
                    ⚠️ Cerca del límite de su plan ({percentOfPlan?.toFixed(0)}%)
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
