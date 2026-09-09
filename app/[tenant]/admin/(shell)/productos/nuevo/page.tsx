import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { getNextReference } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getBusinessTypeProfile } from "@/lib/tenant/business-type";
import { NSProductForm } from "@/components/admin/NSProductForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { createProductAction } from "@/app/[tenant]/admin/actions";

export default async function AdminNewProductPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [categories, nextReference, settings] = await Promise.all([
    listCategories(tenant.id),
    getNextReference(tenant.id),
    getSettings(tenant.id),
  ]);
  const action = createProductAction.bind(null, tenant.id, tenantSlug);
  const profile = getBusinessTypeProfile(tenant.businessType);

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader title="Nuevo producto" description="Completa los datos para publicarlo en el catálogo." />
      <NSProductForm
        tenantSlug={tenantSlug}
        action={action}
        categories={categories}
        nextReference={nextReference}
        submitLabel="Crear producto"
        showSizes={profile.showSizes}
        showColors={profile.showColors}
        settings={settings}
      />
    </div>
  );
}
