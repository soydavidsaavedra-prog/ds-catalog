import { describe, expect, it } from "vitest";
import {
  applyCatalogFilters,
  collectColors,
  collectSizes,
  matchesQuery,
  priceBounds,
  sortProducts,
} from "@/lib/search/catalog-engine";
import type { Product } from "@/lib/types/catalog";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "1",
    slug: "producto-1",
    reference: "REF-1",
    name: "Producto 1",
    price: 100,
    wholesalePrice: null,
    description: "Descripción del producto",
    categorySlug: "herramientas",
    audience: "unisex",
    images: [],
    cardAspectRatio: "portrait",
    imageFit: "cover",
    sizes: [],
    colors: [],
    availability: "in_stock",
    featured: false,
    isNew: false,
    onSale: false,
    active: true,
    hidePaymentBadge: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("matchesQuery", () => {
  it("matches regardless of accents and case", () => {
    const product = makeProduct({ name: "Taladro Percutor" });
    expect(matchesQuery(product, "taladro")).toBe(true);
    expect(matchesQuery(product, "PERCUTOR")).toBe(true);
    expect(matchesQuery(product, "táladro")).toBe(true);
  });

  it("matches across name, reference, category and description", () => {
    const product = makeProduct({
      name: "X",
      reference: "REF-999",
      categorySlug: "pintura",
      description: "acabado mate",
    });
    expect(matchesQuery(product, "REF-999")).toBe(true);
    expect(matchesQuery(product, "pintura")).toBe(true);
    expect(matchesQuery(product, "acabado mate")).toBe(true);
  });

  it("returns true for an empty/whitespace query", () => {
    const product = makeProduct();
    expect(matchesQuery(product, "")).toBe(true);
    expect(matchesQuery(product, "   ")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    const product = makeProduct({ name: "Martillo" });
    expect(matchesQuery(product, "destornillador")).toBe(false);
  });
});

describe("applyCatalogFilters", () => {
  const products = [
    makeProduct({ id: "1", categorySlug: "herramientas", audience: "caballero", price: 50, sizes: [], colors: [], availability: "in_stock" }),
    makeProduct({ id: "2", categorySlug: "pintura", audience: "dama", price: 150, sizes: ["M"], colors: [{ name: "Rojo", hex: "#ff0000" }], availability: "out_of_stock" }),
    makeProduct({ id: "3", categorySlug: "herramientas", audience: "unisex", price: 300, sizes: ["L"], colors: [{ name: "Azul", hex: "#0000ff" }], availability: "low_stock" }),
  ];

  it("filters by category", () => {
    const result = applyCatalogFilters(products, { category: "herramientas" });
    expect(result.map((p) => p.id).sort()).toEqual(["1", "3"]);
  });

  it("filters by audience, always including unisex", () => {
    const result = applyCatalogFilters(products, { audience: "caballero" });
    expect(result.map((p) => p.id).sort()).toEqual(["1", "3"]);
  });

  it("filters by price range", () => {
    const result = applyCatalogFilters(products, { minPrice: 100, maxPrice: 200 });
    expect(result.map((p) => p.id)).toEqual(["2"]);
  });

  it("filters by availability list", () => {
    const result = applyCatalogFilters(products, { availability: ["out_of_stock", "low_stock"] });
    expect(result.map((p) => p.id).sort()).toEqual(["2", "3"]);
  });

  it("filters by sizes and colors", () => {
    expect(applyCatalogFilters(products, { sizes: ["L"] }).map((p) => p.id)).toEqual(["3"]);
    expect(applyCatalogFilters(products, { colors: ["Rojo"] }).map((p) => p.id)).toEqual(["2"]);
  });

  it("combines filters and applies the requested sort", () => {
    const result = applyCatalogFilters(products, { category: "herramientas", sort: "price-desc" });
    expect(result.map((p) => p.id)).toEqual(["3", "1"]);
  });
});

describe("sortProducts", () => {
  const products = [
    makeProduct({ id: "a", name: "Banana", price: 30, featured: false, createdAt: "2024-01-01T00:00:00.000Z" }),
    makeProduct({ id: "b", name: "Alpha", price: 10, featured: true, createdAt: "2024-03-01T00:00:00.000Z" }),
    makeProduct({ id: "c", name: "Cebra", price: 20, featured: false, createdAt: "2024-02-01T00:00:00.000Z" }),
  ];

  it("does not mutate the input array", () => {
    const copy = [...products];
    sortProducts(products, "price-asc");
    expect(products).toEqual(copy);
  });

  it("sorts by price ascending/descending", () => {
    expect(sortProducts(products, "price-asc").map((p) => p.id)).toEqual(["b", "c", "a"]);
    expect(sortProducts(products, "price-desc").map((p) => p.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by newest", () => {
    expect(sortProducts(products, "newest").map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by name ascending", () => {
    expect(sortProducts(products, "name-asc").map((p) => p.id)).toEqual(["b", "a", "c"]);
  });

  it("defaults to featured-first for 'featured' and unknown values", () => {
    expect(sortProducts(products, "featured").map((p) => p.id)[0]).toBe("b");
    expect(sortProducts(products, undefined).map((p) => p.id)[0]).toBe("b");
  });
});

describe("collectSizes / collectColors", () => {
  it("deduplicates sizes across products", () => {
    const products = [makeProduct({ sizes: ["M", "L"] }), makeProduct({ sizes: ["L", "XL"] })];
    expect(collectSizes(products).sort()).toEqual(["L", "M", "XL"]);
  });

  it("deduplicates colors by name, keeping one hex per name", () => {
    const products = [
      makeProduct({ colors: [{ name: "Rojo", hex: "#ff0000" }] }),
      makeProduct({ colors: [{ name: "Rojo", hex: "#ff0000" }, { name: "Azul", hex: "#0000ff" }] }),
    ];
    const colors = collectColors(products);
    expect(colors).toHaveLength(2);
    expect(colors).toContainEqual({ name: "Rojo", hex: "#ff0000" });
    expect(colors).toContainEqual({ name: "Azul", hex: "#0000ff" });
  });
});

describe("priceBounds", () => {
  it("returns min/max across products", () => {
    const products = [makeProduct({ price: 50 }), makeProduct({ price: 10 }), makeProduct({ price: 200 })];
    expect(priceBounds(products)).toEqual({ min: 10, max: 200 });
  });

  it("returns zeros for an empty list", () => {
    expect(priceBounds([])).toEqual({ min: 0, max: 0 });
  });
});
