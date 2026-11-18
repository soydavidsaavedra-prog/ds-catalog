import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getProductById, listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getBusinessTypeProfile } from "@/lib/tenant/business-type";
import { NSProductForm } from "@/components/admin/NSProductForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { updateProductAction, quickCreateCategoryAction } from "@/app/[tenant]/admin/actions";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [product, categories, settings, products] = await Promise.all([
    getProductById(tenant.id, id),
    listCategories(tenant.id),
    getSettings(tenant.id),
    listProducts(tenant.id),
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
        quickCreateCategoryAction={quickCreateCategoryAction.bind(null, tenant.id, tenantSlug)}
        existingReferences={products.map((p) => p.reference)}
        aiAssistEnabled={Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY)}
      />
    </div>
  );
}
