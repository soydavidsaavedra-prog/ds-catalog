import { describe, expect, it } from "vitest";
import { MAX_IMPORT_ROWS, buildProductImportTemplateCsv, parseProductImportCsv } from "@/lib/products/csv-import";
import type { Category } from "@/lib/types/catalog";

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-1",
    slug: "herramientas",
    name: "Herramientas",
    description: "",
    image: "",
    order: 1,
    active: true,
    featured: true,
    parentId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const HEADER = "referencia,nombre,precio,precio_anterior,descripcion,categoria,tallas,disponibilidad,destacado,nuevo,oferta";

describe("parseProductImportCsv", () => {
  it("parses a valid row into a ready-to-insert ProductInput", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,Taladro,49.99,30,Un taladro bueno,herramientas,,disponible,si,no,no\n`;

    const { rows, errors } = parseProductImportCsv(csv, categories, new Set());

    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.input).toMatchObject({
      reference: "REF-1",
      name: "Taladro",
      price: 49.99,
      previousPrice: 30,
      description: "Un taladro bueno",
      categorySlug: "herramientas",
      availability: "in_stock",
      featured: true,
      isNew: false,
      onSale: false,
      colors: [],
      images: ["placeholder:herramientas:new"],
    });
  });

  it("matches a category by name, case- and accent-insensitively, when the slug doesn't match", () => {
    const categories = [makeCategory({ slug: "electricidad", name: "Electricidad" })];
    const csv = `${HEADER}\nREF-1,Cable,10,,,ELECTRICIDAD,,,,,\n`;
    const { rows, errors } = parseProductImportCsv(csv, categories, new Set());
    expect(errors).toEqual([]);
    expect(rows[0]!.input.categorySlug).toBe("electricidad");
  });

  it("reports a missing required field instead of silently skipping the row", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\n,Taladro,49.99,,,herramientas,,,,,\n`;
    const { rows, errors } = parseProductImportCsv(csv, categories, new Set());
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.line).toBe(2);
    expect(errors[0]!.reason).toMatch(/obligatorios/);
  });

  it("rejects a non-numeric or non-positive price", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,Taladro,gratis,,,herramientas,,,,,\nREF-2,Otro,-5,,,herramientas,,,,,\n`;
    const { rows, errors } = parseProductImportCsv(csv, categories, new Set());
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(2);
  });

  it("rejects a row whose category doesn't exist", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,Taladro,10,,,no-existe,,,,,\n`;
    const { rows, errors } = parseProductImportCsv(csv, categories, new Set());
    expect(rows).toHaveLength(0);
    expect(errors[0]!.reason).toMatch(/Categoría no encontrada/);
  });

  it("rejects a row that collides with an already-existing product slug", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,Taladro,10,,,herramientas,,,,,\n`;
    const { rows, errors } = parseProductImportCsv(csv, categories, new Set(["ref-1-taladro"]));
    expect(rows).toHaveLength(0);
    expect(errors[0]!.reason).toMatch(/Ya existe un producto/);
  });

  it("rejects a second row in the same file that collides with an earlier row's slug", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,Taladro,10,,,herramientas,,,,,\nREF-1,Taladro,12,,,herramientas,,,,,\n`;
    const { rows, errors } = parseProductImportCsv(csv, categories, new Set());
    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.line).toBe(3);
  });

  it("derives audience from the category's top-level parent, defaulting to unisex outside the moda tree", () => {
    const dama = makeCategory({ id: "p1", slug: "dama", name: "Dama", parentId: null });
    const skinny = makeCategory({ id: "c1", slug: "skinny", name: "Skinny", parentId: "p1" });
    const herramientas = makeCategory({ id: "p2", slug: "herramientas", name: "Herramientas", parentId: null });

    const csv = `${HEADER}\nREF-1,Jean,10,,,skinny,,,,,\nREF-2,Martillo,10,,,herramientas,,,,,\n`;
    const { rows, errors } = parseProductImportCsv(csv, [dama, skinny, herramientas], new Set());

    expect(errors).toEqual([]);
    expect(rows[0]!.input.audience).toBe("dama");
    expect(rows[1]!.input.audience).toBe("unisex");
  });

  it("splits tallas on semicolons and trims each one", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,Camisa,10,,,herramientas, S ; M ;L ,,,,\n`;
    const { rows } = parseProductImportCsv(csv, categories, new Set());
    expect(rows[0]!.input.sizes).toEqual(["S", "M", "L"]);
  });

  it("parses Spanish availability labels and boolean flags", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,A,10,,,herramientas,,pocas unidades,si,si,si\nREF-2,B,10,,,herramientas,,agotado,no,no,no\n`;
    const { rows } = parseProductImportCsv(csv, categories, new Set());
    expect(rows[0]!.input.availability).toBe("low_stock");
    expect(rows[0]!.input).toMatchObject({ featured: true, isNew: true, onSale: true });
    expect(rows[1]!.input.availability).toBe("out_of_stock");
    expect(rows[1]!.input).toMatchObject({ featured: false, isNew: false, onSale: false });
  });

  it("defaults an unset availability to in_stock", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,A,10,,,herramientas,,,,,\n`;
    const { rows } = parseProductImportCsv(csv, categories, new Set());
    expect(rows[0]!.input.availability).toBe("in_stock");
  });

  it("matches a row's photo by filename, case/whitespace-insensitively", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER},foto\nREF-1,Taladro,49.99,,,herramientas,,,,,,  TALADRO.JPG \n`;
    const { rows, warnings } = parseProductImportCsv(csv, categories, new Set(), [
      { filename: "taladro.jpg", url: "https://cdn/taladro.jpg" },
    ]);
    expect(warnings).toEqual([]);
    expect(rows[0]!.input.images).toEqual(["https://cdn/taladro.jpg"]);
  });

  it("keeps the placeholder image and reports a warning (not an error) when the photo column doesn't match anything uploaded", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER},foto\nREF-1,Taladro,49.99,,,herramientas,,,,,,no-subida.jpg\n`;
    const { rows, errors, warnings } = parseProductImportCsv(csv, categories, new Set(), []);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.input.images).toEqual(["placeholder:herramientas:new"]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]!.reason).toMatch(/no-subida\.jpg/);
  });

  it("uses the placeholder with no warning when the foto column is left empty", () => {
    const categories = [makeCategory()];
    const csv = `${HEADER}\nREF-1,Taladro,49.99,,,herramientas,,,,,\n`;
    const { rows, warnings } = parseProductImportCsv(csv, categories, new Set());
    expect(warnings).toEqual([]);
    expect(rows[0]!.input.images).toEqual(["placeholder:herramientas:new"]);
  });

  it("flags a file with more than MAX_IMPORT_ROWS rows instead of silently truncating without notice", () => {
    const categories = [makeCategory()];
    const lines = Array.from({ length: MAX_IMPORT_ROWS + 5 }, (_, i) => `REF-${i},Producto ${i},10,,,herramientas,,,,,`);
    const csv = `${HEADER}\n${lines.join("\n")}\n`;
    const { rows, errors } = parseProductImportCsv(csv, categories, new Set());
    expect(rows).toHaveLength(MAX_IMPORT_ROWS);
    expect(errors.some((e) => e.reason.includes(String(MAX_IMPORT_ROWS)))).toBe(true);
  });
});

describe("buildProductImportTemplateCsv", () => {
  it("produces a header that parseProductImportCsv actually understands end-to-end", () => {
    const categories = [makeCategory({ slug: "nombre-de-tu-categoria", name: "Nombre de tu categoría" })];
    const template = buildProductImportTemplateCsv();
    const { rows, errors } = parseProductImportCsv(template, categories, new Set());
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
  });
});
