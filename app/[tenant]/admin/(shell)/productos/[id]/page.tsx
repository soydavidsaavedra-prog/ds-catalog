import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getProductById } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getBusinessTypeProfile } from "@/lib/tenant/business-type";
import { NSProductForm } from "@/components/admin/NSProductForm";
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
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Editar producto</h1>
        <p className="mt-1 text-sm text-muted-foreground">{product.reference} — {product.name}</p>
      </div>
      <div className="max-w-5xl rounded-card border border-border bg-surface-elevated p-6">
        <NSProductForm
          tenantSlug={tenantSlug}
          action={action}
          categories={categories}
          product={product}
          submitLabel="Guardar cambios"
          showSizes={profile.showSizes}
          showColors={profile.showColors}
          paymentBadge={{ icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel }}
          brandName={settings.brandName}
        />
      </div>
    </div>
  );
}
