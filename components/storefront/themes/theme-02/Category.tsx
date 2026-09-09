import type { ThemeCategoryProps } from "@/lib/themes/types";
import { CategoryBanner } from "./CategoryBanner";
import { CatalogView } from "./CatalogView";

export function Category({ tenantId, tenantSlug, category, filters, forcedCategorySlugs, settings }: ThemeCategoryProps) {
  return (
    <div>
      <CategoryBanner tenantSlug={tenantSlug} category={category} settings={settings} />
      <CatalogView
        tenantId={tenantId}
        tenantSlug={tenantSlug}
        filters={filters}
        forcedCategorySlugs={forcedCategorySlugs}
        eyebrow="Colección"
        title={category.name}
        description={category.description}
      />
    </div>
  );
}
