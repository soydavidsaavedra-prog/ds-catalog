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
