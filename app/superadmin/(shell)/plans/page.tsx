import type { Metadata } from "next";
import Link from "next/link";
import { listPlans } from "@/lib/repositories/plans-repository";
import { getStorageUsageByTenant, deriveGlobalStorageUsage } from "@/lib/repositories/storage-repository";
import { listAllTenantsWithCounts } from "@/lib/repositories/superadmin-repository";
import { togglePlanActiveAction } from "@/app/superadmin/actions";
import { NSPlanForm } from "@/components/superadmin/NSPlanForm";
import { NSButton } from "@/components/ui/NSButton";

export const metadata: Metadata = {
  title: "Planes",
};

function formatPriceUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function SuperadminPlansPage() {
  const [plans, storageUsage, tenants] = await Promise.all([
    listPlans(),
    getStorageUsageByTenant(),
    listAllTenantsWithCounts(),
  ]);

  const { totalBytes } = deriveGlobalStorageUsage(storageUsage);
  const totalProducts = tenants.reduce((sum, t) => sum + t.counts.products, 0);
  const avgBytesPerProduct = totalProducts > 0 ? totalBytes / totalProducts : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Planes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estructura de planes — sin cobros automáticos todavía. Sirve para asignar límites y precio de referencia
          a cada cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3 rounded-card border border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg uppercase tracking-wide">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{plan.key}</p>
              </div>
              <span
                className={`rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${plan.active ? "border-success/30 bg-success/10 text-success" : "border-border-strong bg-muted/10 text-muted-foreground"}`}
              >
                {plan.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="font-display text-2xl">{formatPriceUsd(plan.priceCents)}<span className="text-sm text-muted-foreground">/mes</span></p>
            {plan.description ? <p className="text-sm text-muted-foreground">{plan.description}</p> : null}
            <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
              <li>Productos: {plan.maxProducts ?? "Sin límite"}</li>
              <li>Storage: {plan.maxStorageMb ? `${plan.maxStorageMb} MB` : "Sin límite"}</li>
              <li>Imágenes: {plan.maxImages ?? "Sin límite"}</li>
            </ul>
            {plan.features.length > 0 ? (
              <ul className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-1 flex gap-2">
              <Link href={`/superadmin/plans/${plan.id}`}>
                <NSButton variant="outline" size="sm">
                  Editar
                </NSButton>
              </Link>
              <form action={togglePlanActiveAction.bind(null, plan.id, !plan.active)}>
                <NSButton type="submit" variant="outline" size="sm">
                  {plan.active ? "Desactivar" : "Activar"}
                </NSButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="font-display text-lg uppercase tracking-wide">Nuevo plan</h2>
        <div className="mt-4">
          <NSPlanForm avgBytesPerProduct={avgBytesPerProduct} />
        </div>
      </div>
    </div>
  );
}
