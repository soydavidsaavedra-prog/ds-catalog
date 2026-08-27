import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getProductById } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getBusinessTypeProfile } from "@/lib/tenant/business-type";
import { NSProductForm } from "@/components/admin/NSProductForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { updateProductAction } from "@/app/[tenant]/admin/actions";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [product, categories, settings] = await Promise.all([
    getProductById(tenant.id, id),
    listCategories(tenant.id),
    getSettings(tenant.id),
  ]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, tenant.id, tenantSlug, id);
  const profile = getBusinessTypeProfile(tenant.businessType);

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader title="Editar producto" description={`${product.reference} — ${product.name}`} />
      <NSProductForm
        tenantSlug={tenantSlug}
        action={action}
        categories={categories}
        product={product}
        submitLabel="Guardar cambios"
        showSizes={profile.showSizes}
        showColors={profile.showColors}
        settings={settings}
      />
    </div>
  );
}
