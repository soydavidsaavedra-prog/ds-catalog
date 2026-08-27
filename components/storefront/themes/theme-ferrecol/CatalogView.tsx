import type { ThemeCatalogProps } from "@/lib/themes/types";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { applyCatalogFilters, collectColors, collectSizes } from "@/lib/search/catalog-engine";
import { NSFilterBar } from "@/components/catalog/NSFilterBar";
import { NSCatalogSearchInput } from "@/components/catalog/NSCatalogSearchInput";
import { ProductGrid } from "./ProductGrid";

interface CatalogViewProps extends ThemeCatalogProps {
  forcedCategorySlugs?: string[];
}

/** Theme Ferrecol's catalog engine view — same filtering/faceting logic as Theme 01's (lib/search/catalog-engine.ts, shared), fresh premium-ecommerce layout. */
export async function CatalogView({
  tenantId,
  tenantSlug,
  filters,
  forcedCategorySlugs,
  eyebrow,
  title,
  description,
}: CatalogViewProps) {
  const [categories, allProducts, settings] = await Promise.all([
    listCategories(tenantId, { activeOnly: true }),
    listProducts(tenantId, { activeOnly: true }),
    getSettings(tenantId),
  ]);

  const scopeProducts = forcedCategorySlugs ? allProducts.filter((p) => forcedCategorySlugs.includes(p.categorySlug)) : allProducts;
  const results = applyCatalogFilters(scopeProducts, filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {forcedCategorySlugs ? null : (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NSCatalogSearchInput />
      </div>

      <div className="mt-5">
        <NSFilterBar
          categories={forcedCategorySlugs ? undefined : categories.filter((c) => c.parentId !== null).map((c) => ({ slug: c.slug, name: c.name }))}
          sizes={collectSizes(scopeProducts)}
          colors={collectColors(scopeProducts)}
          resultCount={results.length}
        />
      </div>

      <div className="mt-8">
        <ProductGrid
          tenantSlug={tenantSlug}
          products={results}
          paymentBadge={{ icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel }}
          brandName={settings.brandName}
        />
      </div>
    </div>
  );
}
