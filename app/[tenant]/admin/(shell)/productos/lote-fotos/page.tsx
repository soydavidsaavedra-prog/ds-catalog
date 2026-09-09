import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { NSProductBatchForm } from "@/components/admin/NSProductBatchForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

export const metadata: Metadata = {
  title: "Crear por lote de fotos",
};

export default async function AdminProductBatchPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const categories = await listCategories(tenant.id);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <DSPageHeader
        title="Crear productos por lote de fotos"
        description="Sube varias fotos de una vez — cada una crea un producto en borrador (oculto en tu catálogo) con un nombre provisional tomado del archivo. Después edítalos uno por uno para poner el nombre, precio y descripción reales."
      />
      <NSProductBatchForm tenantId={tenant.id} tenantSlug={tenantSlug} categories={categories} />
    </div>
  );
}
