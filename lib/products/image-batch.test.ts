import { describe, expect, it } from "vitest";
import { buildBatchProductDrafts, deriveNameFromFilename } from "./image-batch";
import type { Category } from "@/lib/types/catalog";

function makeCategory(overrides: Partial<Category> & Pick<Category, "id" | "slug" | "name">): Category {
  return {
    description: "",
    image: "",
    order: 0,
    active: true,
    featured: false,
    parentId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("deriveNameFromFilename", () => {
  it("strips the extension and title-cases underscore/dash-separated words", () => {
    expect(deriveNameFromFilename("camisa_azul-01.JPG")).toBe("Camisa Azul 01");
  });

  it("collapses repeated separators and trims", () => {
    expect(deriveNameFromFilename("  foto__final--v2.png")).toBe("Foto Final V2");
  });

  it("falls back to Producto for a filename that strips down to nothing", () => {
    expect(deriveNameFromFilename("____.jpg")).toBe("Producto");
    expect(deriveNameFromFilename(".png")).toBe("Producto");
  });

  it("handles a filename with no extension", () => {
    expect(deriveNameFromFilename("IMG 20240101")).toBe("IMG 20240101");
  });
});

describe("buildBatchProductDrafts", () => {
  const dama = makeCategory({ id: "cat-dama", slug: "dama", name: "Dama" });
  const jeans = makeCategory({ id: "cat-jeans", slug: "jeans-dama", name: "Jeans", parentId: "cat-dama" });
  const categories = [dama, jeans];

  it("creates one inactive draft per item, in the chosen category, with the placeholder-free real image", () => {
    const drafts = buildBatchProductDrafts({
      items: [{ filename: "foto1.jpg", url: "https://cdn/foto1.jpg" }],
      category: jeans,
      categories,
      startingReferenceNumber: 1,
      existingSlugs: new Set(),
    });

    expect(drafts).toHaveLength(1);
    expect(drafts[0]!.input.active).toBe(false);
    expect(drafts[0]!.input.categorySlug).toBe("jeans-dama");
    expect(drafts[0]!.input.images).toEqual(["https://cdn/foto1.jpg"]);
    expect(drafts[0]!.input.price).toBe(0);
  });

  it("derives audience from the category's top-level parent", () => {
    const drafts = buildBatchProductDrafts({
      items: [{ filename: "a.jpg", url: "u" }],
      category: jeans,
      categories,
      startingReferenceNumber: 1,
      existingSlugs: new Set(),
    });
    expect(drafts[0]!.input.audience).toBe("dama");
  });

  it("falls back to unisex audience outside the dama/caballero/nino tree", () => {
    const ferreteria = makeCategory({ id: "cat-f", slug: "herramientas", name: "Herramientas" });
    const drafts = buildBatchProductDrafts({
      items: [{ filename: "a.jpg", url: "u" }],
      category: ferreteria,
      categories: [ferreteria],
      startingReferenceNumber: 1,
      existingSlugs: new Set(),
    });
    expect(drafts[0]!.input.audience).toBe("unisex");
  });

  it("assigns sequential references starting from the given number", () => {
    const drafts = buildBatchProductDrafts({
      items: [
        { filename: "a.jpg", url: "u1" },
        { filename: "b.jpg", url: "u2" },
        { filename: "c.jpg", url: "u3" },
      ],
      category: dama,
      categories,
      startingReferenceNumber: 45,
      existingSlugs: new Set(),
    });
    expect(drafts.map((d) => d.input.reference)).toEqual(["NS-045", "NS-046", "NS-047"]);
  });

  it("appends a numeric suffix when the computed slug already exists", () => {
    const drafts = buildBatchProductDrafts({
      items: [{ filename: "foto.jpg", url: "u1" }],
      category: dama,
      categories,
      startingReferenceNumber: 1,
      existingSlugs: new Set(["ns-001-foto"]),
    });
    expect(drafts[0]!.input.slug).toBe("ns-001-foto-2");
  });
});
