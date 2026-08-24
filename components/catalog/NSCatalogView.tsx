import type { CatalogFilters } from "@/lib/types/catalog";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import {
  applyCatalogFilters,
  collectColors,
  collectSizes,
} from "@/lib/search/catalog-engine";
import { NSFilterBar } from "@/components/catalog/NSFilterBar";
import { NSCatalogSearchInput } from "@/components/catalog/NSCatalogSearchInput";
import { NSProductGrid } from "@/components/catalog/NSProductGrid";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";

interface NSCatalogViewProps {
  filters: CatalogFilters;
  /**
   * When set (a /[category] page), the category picker is hidden and facets
   * scope to these slugs. A leaf category passes just its own slug; a
   * top-level category (e.g. Dama) passes its own slug plus every
   * subcategory's slug, aggregating products across all of them.
   */
  forcedCategorySlugs?: string[];
  eyebrow: string;
  title: string;
  description?: string;
}

/**
 * The single Catalog Engine used by /catalogo and every /[category] route.
 * Nothing about listing, filtering, faceting or sorting products is
 * duplicated between those routes — only the heading copy and an optional
 * forced category differ.
 */
export async function NSCatalogView({
  filters,
  forcedCategorySlugs,
  eyebrow,
  title,
  description,
}: NSCatalogViewProps) {
  const [categories, allProducts, settings] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({ activeOnly: true }),
    getSettings(),
  ]);

  const scopeProducts = forcedCategorySlugs
    ? allProducts.filter((p) => forcedCategorySlugs.includes(p.categorySlug))
    : allProducts;

  const results = applyCatalogFilters(scopeProducts, filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {forcedCategorySlugs ? null : (
        <NSSectionHeading eyebrow={eyebrow} title={title} description={description} />
      )}

      <div className={forcedCategorySlugs ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" : "mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}>
        <NSCatalogSearchInput />
      </div>

      <div className="mt-5">
        <NSFilterBar
          categories={
            forcedCategorySlugs
              ? undefined
              : categories.filter((c) => c.parentId !== null).map((c) => ({ slug: c.slug, name: c.name }))
          }
          sizes={collectSizes(scopeProducts)}
          colors={collectColors(scopeProducts)}
          resultCount={results.length}
        />
      </div>

      <div className="mt-8">
        <NSProductGrid
          products={results}
          paymentBadge={{ icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel }}
        />
      </div>
    </div>
  );
}
