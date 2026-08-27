import type { ThemeCategoryProps } from "@/lib/themes/types";
import { NSCategoryHero } from "./NSCategoryHero";
import { NSCatalogView } from "./NSCatalogView";

/** Theme 01's category-listing composition — moved here verbatim from app/[tenant]/(storefront)/[category]/page.tsx. */
export function Category({ tenantId, tenantSlug, category, filters, forcedCategorySlugs, settings }: ThemeCategoryProps) {
  return (
    <div>
      <NSCategoryHero category={category} brandName={settings.brandName} />
      <NSCatalogView
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
