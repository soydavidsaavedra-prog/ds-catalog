import { describe, expect, it } from "vitest";
import { parseCatalogSearchParams } from "@/lib/search/catalog-params";

describe("parseCatalogSearchParams", () => {
  it("parses a full valid query string", () => {
    const filters = parseCatalogSearchParams({
      q: "taladro",
      category: "herramientas",
      audience: "caballero",
      talla: "M,L",
      color: "Rojo,Azul",
      disponibilidad: "in_stock,low_stock",
      min: "10",
      max: "200",
      sort: "price-asc",
    });
    expect(filters).toEqual({
      query: "taladro",
      category: "herramientas",
      audience: "caballero",
      sizes: ["M", "L"],
      colors: ["Rojo", "Azul"],
      availability: ["in_stock", "low_stock"],
      minPrice: 10,
      maxPrice: 200,
      sort: "price-asc",
    });
  });

  it("drops invalid enum values instead of passing them through", () => {
    const filters = parseCatalogSearchParams({ audience: "marciano", sort: "aleatorio", disponibilidad: "en-camino" });
    expect(filters.audience).toBeUndefined();
    expect(filters.sort).toBeUndefined();
    expect(filters.availability).toBeUndefined();
  });

  it("lets a category override win over the query string's own category", () => {
    const filters = parseCatalogSearchParams({ category: "pintura" }, { category: "herramientas" });
    expect(filters.category).toBe("herramientas");
  });

  it("takes the first value when a param arrives as an array", () => {
    const filters = parseCatalogSearchParams({ q: ["primero", "segundo"] });
    expect(filters.query).toBe("primero");
  });

  it("returns an all-undefined filter set for an empty search params object", () => {
    const filters = parseCatalogSearchParams({});
    expect(filters).toEqual({
      query: undefined,
      category: undefined,
      audience: undefined,
      sizes: undefined,
      colors: undefined,
      availability: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: undefined,
    });
  });
});
