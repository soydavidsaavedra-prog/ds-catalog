import { parse } from "csv-parse/sync";
import { slugify } from "@/lib/utils/slug";
import type { Audience, Availability, Category } from "@/lib/types/catalog";
import type { ProductInput } from "@/lib/repositories/product-repository";

/**
 * Bulk product import from a CSV a tenant uploads at /admin/productos/importar
 * — the biggest onboarding friction point for a business migrating an
 * existing catalog in one at a time. Deliberately excludes photos and
 * colors: a flat CSV cell is a poor fit for either (an image needs an
 * actual upload, a color needs a name+hex pair), so an imported row gets
 * the same placeholder art a manually-created product with no photos yet
 * gets (see parseProductInput in app/[tenant]/admin/actions.ts) — never a
 * fabricated image. The template and this module's own errors say so
 * plainly rather than pretending otherwise.
 *
 * Pure and DB-free on purpose: takes the tenant's already-fetched
 * categories and already-fetched set of taken slugs as plain arguments,
 * so this is fully unit-testable without mocking Supabase — the calling
 * Server Action (app/[tenant]/admin/productos/importar/actions.ts) is
 * the only place that touches the database, via createProduct per valid
 * row.
 */

export const MAX_IMPORT_ROWS = 500;

const AVAILABILITY_VALUES: Availability[] = ["in_stock", "low_stock", "out_of_stock"];
const AVAILABILITY_LABELS: Record<string, Availability> = {
  disponible: "in_stock",
  en_stock: "in_stock",
  in_stock: "in_stock",
  "pocas unidades": "low_stock",
  pocas_unidades: "low_stock",
  low_stock: "low_stock",
  agotado: "out_of_stock",
  out_of_stock: "out_of_stock",
};

const AUDIENCE_VALUES: Audience[] = ["dama", "caballero", "nino", "unisex"];

export interface ProductImportError {
  /** 1-based, counting the header row as line 1 — matches what a person sees opening the file in a spreadsheet app. */
  line: number;
  reason: string;
}

export interface ProductImportRow {
  line: number;
  input: ProductInput;
}

export interface ProductImportPhoto {
  /** Original filename, matched against the CSV's optional "foto" column case/whitespace-insensitively. */
  filename: string;
  /** Public Storage URL — already uploaded by the time this module sees it. */
  url: string;
}

export interface ProductImportResult {
  rows: ProductImportRow[];
  errors: ProductImportError[];
  /** A row still imports (with the usual placeholder image) when its "foto" column doesn't match any uploaded photo — this is reported here, separately from `errors`, since it isn't a reason to skip the row. */
  warnings: ProductImportError[];
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function parseBoolean(value: string | undefined): boolean {
  const v = normalize(value ?? "");
  return v === "si" || v === "sí" || v === "true" || v === "1" || v === "yes";
}

function resolveAvailability(value: string | undefined): Availability {
  if (!value) return "in_stock";
  const normalized = normalize(value);
  return AVAILABILITY_LABELS[normalized] ?? (AVAILABILITY_VALUES.includes(value as Availability) ? (value as Availability) : "in_stock");
}

/** Same audience-derived-from-category-tree rule as resolveAudienceForCategory in app/[tenant]/admin/actions.ts, just synchronous over an already-fetched category list instead of two DB round-trips per row. */
function resolveAudience(category: Category, categoriesById: Map<string, Category>): Audience {
  const topLevel = category.parentId ? categoriesById.get(category.parentId) : category;
  const slug = topLevel?.slug;
  return AUDIENCE_VALUES.includes(slug as Audience) ? (slug as Audience) : "unisex";
}

function findCategory(value: string, categories: Category[], categoriesBySlug: Map<string, Category>): Category | null {
  const bySlug = categoriesBySlug.get(value.trim());
  if (bySlug) return bySlug;
  const normalized = normalize(value);
  return categories.find((c) => normalize(c.name) === normalized) ?? null;
}

/**
 * Parses and validates a CSV's rows into ready-to-insert ProductInput
 * values, or per-row errors — never throws for a malformed row, only for
 * a CSV so broken it can't be parsed as a table at all (see the
 * try/catch this needs at the call site).
 */
export function parseProductImportCsv(
  csvText: string,
  categories: Category[],
  existingSlugs: Set<string>,
  photos: ProductImportPhoto[] = [],
): ProductImportResult {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  // Two separate maps, not one: parent lookups need id -> Category, the
  // CSV's own "categoria" column needs slug (or name) -> Category.
  const categoriesById = new Map(categories.map((c) => [c.id, c] as const));
  const categoriesBySlug = new Map(categories.map((c) => [c.slug, c] as const));
  const photosByFilename = new Map(photos.map((p) => [normalize(p.filename), p.url] as const));

  const rows: ProductImportRow[] = [];
  const errors: ProductImportError[] = [];
  const warnings: ProductImportError[] = [];
  const seenSlugs = new Set(existingSlugs);

  if (records.length > MAX_IMPORT_ROWS) {
    errors.push({
      line: MAX_IMPORT_ROWS + 2,
      reason: `El archivo tiene ${records.length} filas — solo se procesan las primeras ${MAX_IMPORT_ROWS}. Divide el resto en otro archivo.`,
    });
  }

  records.slice(0, MAX_IMPORT_ROWS).forEach((record, index) => {
    const line = index + 2; // +1 for 1-based, +1 for the header row already consumed by `columns: true`.

    const reference = (record.referencia ?? "").trim();
    const name = (record.nombre ?? "").trim();
    const priceRaw = (record.precio ?? "").trim();
    const categoryValue = (record.categoria ?? "").trim();

    if (!reference || !name || !priceRaw || !categoryValue) {
      errors.push({ line, reason: "Faltan campos obligatorios (referencia, nombre, precio o categoría)." });
      return;
    }

    const price = Number(priceRaw.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      errors.push({ line, reason: `Precio inválido: "${priceRaw}".` });
      return;
    }

    const category = findCategory(categoryValue, categories, categoriesBySlug);
    if (!category) {
      errors.push({ line, reason: `Categoría no encontrada: "${categoryValue}".` });
      return;
    }

    const slug = slugify(`${reference}-${name}`);
    if (seenSlugs.has(slug)) {
      errors.push({ line, reason: `Ya existe un producto con esa referencia/nombre ("${reference} ${name}").` });
      return;
    }
    seenSlugs.add(slug);

    const previousPriceRaw = (record.precio_anterior ?? "").trim();
    const previousPrice = previousPriceRaw ? Number(previousPriceRaw.replace(",", ".")) : null;

    const sizes = (record.tallas ?? "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    const photoFilename = (record.foto ?? "").trim();
    let images = [`placeholder:${category.slug}:new`];
    if (photoFilename) {
      const matchedUrl = photosByFilename.get(normalize(photoFilename));
      if (matchedUrl) {
        images = [matchedUrl];
      } else {
        warnings.push({
          line,
          reason: `Foto "${photoFilename}" no encontrada entre las imágenes subidas — se usó un marcador de posición.`,
        });
      }
    }

    const input: ProductInput = {
      slug,
      reference,
      name,
      price,
      previousPrice: previousPrice !== null && Number.isFinite(previousPrice) ? previousPrice : null,
      description: (record.descripcion ?? "").trim(),
      categorySlug: category.slug,
      audience: resolveAudience(category, categoriesById),
      images,
      cardAspectRatio: "portrait",
      imageFit: "cover",
      sizes,
      colors: [],
      availability: resolveAvailability(record.disponibilidad),
      featured: parseBoolean(record.destacado),
      isNew: parseBoolean(record.nuevo),
      onSale: parseBoolean(record.oferta),
      active: true,
      hidePaymentBadge: false,
    };

    rows.push({ line, input });
  });

  return { rows, errors, warnings };
}

/** The downloadable template's exact header row + one filled-in example — kept in code (not a static file) so it can never silently drift from what parseProductImportCsv actually reads. */
export function buildProductImportTemplateCsv(): string {
  const header =
    "referencia,nombre,precio,precio_anterior,descripcion,categoria,tallas,disponibilidad,destacado,nuevo,oferta,foto";
  const example =
    "REF-001,Ejemplo de producto,29.99,,Descripción breve del producto,nombre-de-tu-categoria,S;M;L,disponible,no,si,no,foto-ejemplo.jpg";
  return `${header}\n${example}\n`;
}
