import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { getNextReference } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getBusinessTypeProfile } from "@/lib/tenant/business-type";
import { deriveReferencePrefix } from "@/lib/products/reference-prefix";
import { NSProductForm } from "@/components/admin/NSProductForm";
import { NSFloatingPanel } from "@/components/ui/NSFloatingPanel";
import { createProductAction } from "@/app/[tenant]/admin/actions";

/**
 * Shared by the standalone route (app/[tenant]/admin/(shell)/productos/nuevo/page.tsx,
 * used on a direct/hard navigation) and the intercepted modal route
 * (@modal/(.)nuevo/page.tsx, used on a normal in-app click from /productos)
 * so both render identical content — the only difference is whether the
 * products list stays mounted behind it.
 */
export async function NewProductPanel({ tenantSlug }: { tenantSlug: string }) {
  const tenant = await resolveTenant(tenantSlug);
  const [categories, nextReference, settings] = await Promise.all([
    listCategories(tenant.id),
    getNextReference(tenant.id, deriveReferencePrefix(tenant.name)),
    getSettings(tenant.id),
  ]);
  const action = createProductAction.bind(null, tenant.id, tenantSlug);
  const profile = getBusinessTypeProfile(tenant.businessType);

  return (
    <NSFloatingPanel title="Nuevo producto" closeHref={`/${tenantSlug}/admin/productos`}>
      <p className="mb-6 text-sm text-muted-foreground">Completa los datos para publicarlo en el catálogo.</p>
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
    </NSFloatingPanel>
  );
}
