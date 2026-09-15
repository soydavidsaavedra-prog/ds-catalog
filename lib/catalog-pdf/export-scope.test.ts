import { describe, expect, it } from "vitest";
import { selectProductsForExport } from "@/lib/catalog-pdf/export-scope";
import type { Product } from "@/lib/types/catalog";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "1",
    slug: "producto-1",
    reference: "REF-1",
    name: "Producto 1",
    price: 100,
    previousPrice: null,
    description: "",
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
    stock: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("selectProductsForExport", () => {
  const products = [
    makeProduct({ id: "1", categorySlug: "herramientas", active: true }),
    makeProduct({ id: "2", categorySlug: "pintura", active: true }),
    makeProduct({ id: "3", categorySlug: "herramientas", active: false }),
  ];

  it("scope 'all' returns only active products", () => {
    expect(selectProductsForExport(products, { scope: "all" }).map((p) => p.id)).toEqual(["1", "2"]);
  });

  it("scope 'category' returns only active products in that category", () => {
    expect(selectProductsForExport(products, { scope: "category", categorySlug: "herramientas" }).map((p) => p.id)).toEqual(["1"]);
  });

  it("scope 'category' with no category returns nothing", () => {
    expect(selectProductsForExport(products, { scope: "category", categorySlug: null })).toEqual([]);
  });

  it("scope 'selection' respects explicit ids, including inactive ones", () => {
    expect(selectProductsForExport(products, { scope: "selection", productIds: ["3", "2"] }).map((p) => p.id).sort()).toEqual(["2", "3"]);
  });

  it("scope 'selection' with no ids returns nothing", () => {
    expect(selectProductsForExport(products, { scope: "selection", productIds: [] })).toEqual([]);
    expect(selectProductsForExport(products, { scope: "selection" })).toEqual([]);
  });
});
