import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { NSExportCatalogForm } from "@/components/admin/NSExportCatalogForm";

export const metadata: Metadata = {
  title: "Exportar catálogo",
};

export default async function AdminProductsExportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [products, categories] = await Promise.all([listProducts(tenant.id), listCategories(tenant.id)]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <DSPageHeader
        title="Exportar catálogo a PDF"
        description="Genera un PDF con tu marca para compartir tus productos con clientes o distribuidores."
      />

      <NSExportCatalogForm tenantSlug={tenantSlug} products={products} categories={categories} />
    </div>
  );
}
