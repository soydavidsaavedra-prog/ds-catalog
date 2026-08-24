import type { Audience, Availability, CatalogFilters, SortOption } from "@/lib/types/catalog";

export type SearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS: SortOption[] = ["featured", "newest", "price-asc", "price-desc", "name-asc"];
const AUDIENCES: Audience[] = ["dama", "caballero", "nino", "unisex"];
const AVAILABILITIES: Availability[] = ["in_stock", "low_stock", "out_of_stock"];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function csv(value: string | string[] | undefined): string[] | undefined {
  const v = first(value);
  if (!v) return undefined;
  return v.split(",").filter(Boolean);
}

/** Parses the shared query-string contract used by /catalogo and every /[category] page. */
export function parseCatalogSearchParams(
  searchParams: SearchParams,
  overrides?: { category?: string },
): CatalogFilters {
  const sort = first(searchParams.sort);
  const audience = first(searchParams.audience);
  const availability = csv(searchParams.disponibilidad)?.filter((a): a is Availability =>
    AVAILABILITIES.includes(a as Availability),
  );

  return {
    query: first(searchParams.q),
    category: overrides?.category ?? first(searchParams.category),
    audience: audience && AUDIENCES.includes(audience as Audience) ? (audience as Audience) : undefined,
    sizes: csv(searchParams.talla),
    colors: csv(searchParams.color),
    availability: availability && availability.length > 0 ? availability : undefined,
    minPrice: first(searchParams.min) ? Number(first(searchParams.min)) : undefined,
    maxPrice: first(searchParams.max) ? Number(first(searchParams.max)) : undefined,
    sort: sort && SORT_OPTIONS.includes(sort as SortOption) ? (sort as SortOption) : undefined,
  };
}
