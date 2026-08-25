import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { getNextReference } from "@/lib/repositories/product-repository";
import { NSProductForm } from "@/components/admin/NSProductForm";
import { createProductAction } from "@/app/[tenant]/admin/actions";

export default async function AdminNewProductPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [categories, nextReference] = await Promise.all([
    listCategories(tenant.id),
    getNextReference(tenant.id),
  ]);
  const action = createProductAction.bind(null, tenant.id, tenantSlug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Nuevo producto</h1>
        <p className="mt-1 text-sm text-muted-foreground">Completa los datos para publicarlo en el catálogo.</p>
      </div>
      <div className="max-w-2xl rounded-card border border-border bg-surface-elevated p-6">
        <NSProductForm
          tenantSlug={tenantSlug}
          action={action}
          categories={categories}
          nextReference={nextReference}
          submitLabel="Crear producto"
        />
      </div>
    </div>
  );
}
