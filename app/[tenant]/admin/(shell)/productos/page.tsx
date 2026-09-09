import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { NSButton } from "@/components/ui/NSButton";
import { NSProductsTable } from "@/components/admin/NSProductsTable";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const { estado } = await searchParams;
  const tenant = await resolveTenant(tenantSlug);
  const [products, categories] = await Promise.all([listProducts(tenant.id), listCategories(tenant.id)]);
  const categoryOptions: [string, string][] = categories
    .filter((c) => products.some((p) => p.categorySlug === c.slug))
    .map((c) => [c.slug, c.name]);
  const initialStatusFilter = estado === "inactivo" ? "inactive" : estado === "activo" ? "active" : "all";

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader
        title="Productos"
        description={`${products.length} productos en catálogo.`}
        actions={
          <>
            <NSButton href={`/${tenantSlug}/admin/productos/importar`} variant="outline" size="sm">
              Importar CSV
            </NSButton>
            <NSButton href={`/${tenantSlug}/admin/productos/lote-fotos`} variant="outline" size="sm">
              Crear por lote de fotos
            </NSButton>
            <NSButton href={`/${tenantSlug}/admin/productos/nuevo`} size="sm">+ Nuevo producto</NSButton>
          </>
        }
      />

      <NSProductsTable
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        products={products}
        categoryOptions={categoryOptions}
        initialStatusFilter={initialStatusFilter}
      />
    </div>
  );
}
