import type { Product } from "@/lib/types/catalog";

export type CatalogExportScope = "all" | "category" | "selection";

export interface CatalogExportRequest {
  scope: CatalogExportScope;
  categorySlug?: string | null;
  productIds?: string[] | null;
}

/**
 * "Todo el catálogo" y "una categoría" reflejan lo que un cliente vería en
 * la tienda — solo productos activos. "Selección manual" respeta
 * exactamente lo que el tenant marcó a mano, activo o no, porque eligió
 * cada producto explícitamente (ej. una lista de precios interna).
 */
export function selectProductsForExport(products: Product[], request: CatalogExportRequest): Product[] {
  if (request.scope === "category") {
    if (!request.categorySlug) return [];
    return products.filter((p) => p.active && p.categorySlug === request.categorySlug);
  }

  if (request.scope === "selection") {
    const ids = new Set(request.productIds ?? []);
    if (ids.size === 0) return [];
    return products.filter((p) => ids.has(p.id));
  }

  return products.filter((p) => p.active);
}
