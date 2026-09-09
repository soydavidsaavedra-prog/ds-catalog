import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories, buildCategoryTree } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { HeaderClient } from "./HeaderClient";

export async function Header({ tenantSlug }: { tenantSlug: string }) {
  const tenant = await resolveTenant(tenantSlug);
  const [categories, settings] = await Promise.all([
    listCategories(tenant.id, { activeOnly: true }),
    getSettings(tenant.id),
  ]);
  const tree = buildCategoryTree(categories);

  return (
    <HeaderClient
      tenantSlug={tenantSlug}
      parents={tree.map((parent) => ({
        slug: parent.slug,
        name: parent.name,
        children: parent.children.map((c) => ({ slug: c.slug, name: c.name })),
      }))}
      brandName={settings.brandName}
      logoSrc={settings.brandLogo}
      tagline={settings.heroSubtitle}
    />
  );
}
