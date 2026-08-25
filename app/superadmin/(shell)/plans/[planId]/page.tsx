import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlanById } from "@/lib/repositories/plans-repository";
import { getStorageUsageByTenant, deriveGlobalStorageUsage } from "@/lib/repositories/storage-repository";
import { listAllTenantsWithCounts } from "@/lib/repositories/superadmin-repository";
import { NSPlanForm } from "@/components/superadmin/NSPlanForm";

export const metadata: Metadata = {
  title: "Editar plan",
};

export default async function SuperadminEditPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const [plan, storageUsage, tenants] = await Promise.all([
    getPlanById(planId),
    getStorageUsageByTenant(),
    listAllTenantsWithCounts(),
  ]);
  if (!plan) notFound();

  const { totalBytes } = deriveGlobalStorageUsage(storageUsage);
  const totalProducts = tenants.reduce((sum, t) => sum + t.counts.products, 0);
  const avgBytesPerProduct = totalProducts > 0 ? totalBytes / totalProducts : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Editar plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los clientes con este plan asignado quedan sujetos a los límites nuevos de inmediato.
        </p>
      </div>
      <NSPlanForm plan={plan} avgBytesPerProduct={avgBytesPerProduct} />
    </div>
  );
}
