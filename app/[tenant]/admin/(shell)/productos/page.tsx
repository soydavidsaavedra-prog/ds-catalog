import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { NSButton } from "@/components/ui/NSButton";
import { NSProductsTable } from "@/components/admin/NSProductsTable";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [products, categories] = await Promise.all([listProducts(tenant.id), listCategories(tenant.id)]);
  const categoryOptions: [string, string][] = categories
    .filter((c) => products.some((p) => p.categorySlug === c.slug))
    .map((c) => [c.slug, c.name]);

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader
        title="Productos"
        description={`${products.length} productos en catálogo.`}
        actions={<NSButton href={`/${tenantSlug}/admin/productos/nuevo`} size="sm">+ Nuevo producto</NSButton>}
      />

      <NSProductsTable
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        products={products}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
