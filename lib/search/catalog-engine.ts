import type { CatalogFilters, Product } from "@/lib/types/catalog";

/**
 * Single filtering/sorting/search engine shared by /catalogo and every
 * per-category route (/skinny, /dama, ...). Nothing about product
 * discovery is duplicated between those pages — they all call this with
 * a different starting filter.
 */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesQuery(product: Product, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize(
    `${product.name} ${product.reference} ${product.categorySlug} ${product.description}`,
  );
  return haystack.includes(q);
}

export function applyCatalogFilters(products: Product[], filters: CatalogFilters): Product[] {
  let result = products;

  if (filters.category) {
    result = result.filter((p) => p.categorySlug === filters.category);
  }
  if (filters.audience) {
    result = result.filter((p) => p.audience === filters.audience || p.audience === "unisex");
  }
  if (filters.query) {
    result = result.filter((p) => matchesQuery(p, filters.query!));
  }
  if (filters.sizes && filters.sizes.length > 0) {
    result = result.filter((p) => p.sizes.some((s) => filters.sizes!.includes(s)));
  }
  if (filters.colors && filters.colors.length > 0) {
    result = result.filter((p) => p.colors.some((c) => filters.colors!.includes(c.name)));
  }
  if (filters.availability && filters.availability.length > 0) {
    result = result.filter((p) => filters.availability!.includes(p.availability));
  }
  if (typeof filters.minPrice === "number") {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === "number") {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  return sortProducts(result, filters.sort ?? "featured");
}

export function sortProducts(products: Product[], sort: CatalogFilters["sort"]): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return list.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function collectSizes(products: Product[]): string[] {
  const set = new Set<string>();
  products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
  return Array.from(set);
}

export function collectColors(products: Product[]): { name: string; hex: string }[] {
  const map = new Map<string, string>();
  products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
  return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
}

export function priceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export interface CatalogEmptyState {
  title: string;
  description: string;
}

function hasAnyFilter(filters: CatalogFilters): boolean {
  return Boolean(
    filters.query ||
      filters.category ||
      filters.audience ||
      (filters.sizes && filters.sizes.length > 0) ||
      (filters.colors && filters.colors.length > 0) ||
      (filters.availability && filters.availability.length > 0) ||
      typeof filters.minPrice === "number" ||
      typeof filters.maxPrice === "number",
  );
}

/**
 * Distinguishes "there's genuinely nothing here yet" from "your filters/
 * search matched nothing" — same zero-results grid either way, but a very
 * different message depending on why. `scopeCount` is the product count
 * BEFORE filters are applied (the category/catalog's real size), so an
 * active filter that happens to match zero products in a non-empty catalog
 * still reads as "adjust your search," never "empty catalog."
 */
export function getCatalogEmptyState(
  scopeCount: number,
  filters: CatalogFilters,
  scope: "catalog" | "category" = "catalog",
): CatalogEmptyState {
  if (hasAnyFilter(filters)) {
    return {
      title: "No encontramos lo que buscas",
      description: "Prueba con otro término o explora otra categoría.",
    };
  }
  if (scopeCount === 0) {
    return scope === "category"
      ? { title: "Esta categoría está tomando forma", description: "Muy pronto vas a encontrar productos aquí." }
      : { title: "Tu catálogo está tomando forma", description: "Cuando agregues tus primeros productos aparecerán aquí." };
  }
  return {
    title: "No encontramos productos",
    description: "Prueba ajustando los filtros o la búsqueda.",
  };
}
