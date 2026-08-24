import type { CatalogFilters } from "@/lib/types/catalog";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
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
  /** When set (a /[category] page), the category picker is hidden and facets scope to this category. */
  forcedCategorySlug?: string;
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
  forcedCategorySlug,
  eyebrow,
  title,
  description,
}: NSCatalogViewProps) {
  const [categories, allProducts] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({ activeOnly: true }),
  ]);

  const scopeProducts = forcedCategorySlug
    ? allProducts.filter((p) => p.categorySlug === forcedCategorySlug)
    : allProducts;

  const results = applyCatalogFilters(scopeProducts, {
    ...filters,
    category: forcedCategorySlug ?? filters.category,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {forcedCategorySlug ? null : (
        <NSSectionHeading eyebrow={eyebrow} title={title} description={description} />
      )}

      <div className={forcedCategorySlug ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" : "mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}>
        <NSCatalogSearchInput />
      </div>

      <div className="mt-5">
        <NSFilterBar
          categories={forcedCategorySlug ? undefined : categories.map((c) => ({ slug: c.slug, name: c.name }))}
          sizes={collectSizes(scopeProducts)}
          colors={collectColors(scopeProducts)}
          resultCount={results.length}
        />
      </div>

      <div className="mt-8">
        <NSProductGrid products={results} />
      </div>
    </div>
  );
}
