import { slugify } from "@/lib/utils/slug";
import type { Audience, Category } from "@/lib/types/catalog";
import type { ProductInput } from "@/lib/repositories/product-repository";
import { normalizeForDuplicateCheck } from "@/lib/products/duplicates";

/**
 * Bulk product creation from a batch of already-uploaded images — one
 * product per image, for a tenant with a pile of product photos and no
 * catalog data entered yet (see app/[tenant]/admin/(shell)/productos/
 * lote-fotos/). Each product is created INACTIVE (a draft, hidden from
 * the public storefront) with a provisional name derived from the
 * filename — the tenant is expected to open each one afterward and fill
 * in the real name, price and description. This is the image-upload
 * sibling of lib/products/csv-import.ts, which instead bulk-creates from
 * a CSV with no photos; the two are deliberately opposite trade-offs
 * (real photos + fake text here, real text + placeholder photo there).
 *
 * Pure and DB-free on purpose, same reasoning as csv-import.ts: takes the
 * tenant's already-fetched categories and already-taken slugs as plain
 * arguments, so this is fully unit-testable without mocking Supabase —
 * the calling Server Action (.../lote-fotos/actions.ts) is the only place
 * that touches the database, via createProduct per draft, and the only
 * place that uploads anything (the client component does that before
 * ever calling the action — see NSProductBatchForm.tsx).
 */

/**
 * Cap on how many products one batch call creates — independent of
 * plan.maxProducts (which the Server Action enforces separately). Mainly
 * a resilience limit: 100 sequential compress+upload round trips from the
 * browser is already a lot to ask of one tab/connection; more than that
 * should be split into another batch.
 */
export const MAX_BATCH_IMAGES = 100;

const AUDIENCE_VALUES: Audience[] = ["dama", "caballero", "nino", "unisex"];

/** Same audience-derived-from-category-tree rule as resolveAudienceForCategory in app/[tenant]/admin/actions.ts and csv-import.ts's own copy — duplicated for the same reason theirs is: this stays synchronous over an already-fetched category list instead of a DB round-trip. */
function resolveAudience(category: Category, categoriesById: Map<string, Category>): Audience {
  const topLevel = category.parentId ? categoriesById.get(category.parentId) : category;
  const slug = topLevel?.slug;
  return AUDIENCE_VALUES.includes(slug as Audience) ? (slug as Audience) : "unisex";
}

/**
 * Turns "camisa_azul-01.JPG" into "Camisa Azul 01" — a readable starting
 * point, never a finished product title. Falls back to "Producto" for a
 * filename that strips down to nothing (e.g. "____.jpg" or a name made
 * entirely of punctuation).
 */
export function deriveNameFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^./]+$/, "");
  const cleaned = withoutExtension
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Producto";
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface BatchImageItem {
  /** Original filename, kept only to derive the name and to label errors — never stored. */
  filename: string;
  /** Public Storage URL — already uploaded by the time this module sees it. */
  url: string;
}

export interface BatchProductDraft {
  filename: string;
  input: ProductInput;
}

export interface BuildBatchDraftsInput {
  items: BatchImageItem[];
  /** The one category every product in this batch is assigned to — a batch has no per-image category info, so this is chosen once for the whole upload. */
  category: Category;
  /** Full tree, needed only to resolve `category`'s top-level parent for audience. */
  categories: Category[];
  /** First reference number to use (e.g. 46 for "NS-046") — the caller computes this once via getNextReference, then this function increments it locally per item so two batches submitted close together can never collide on the same number (same reasoning as createHeroSlideAction's `order` in app/[tenant]/admin/actions.ts). */
  startingReferenceNumber: number;
  existingSlugs: Set<string>;
  /** Shared starting price applied to every product in the batch — still just a placeholder the tenant can fix per item, but saves re-typing the same number on every draft when a whole lote shares one price. Defaults to 0 (the original behavior). */
  price?: number;
  /** When true, every draft is created visible on the storefront immediately instead of as a hidden draft — for a tenant who trusts the batch as-is and wants to skip the activate step entirely. Defaults to false (the original, safer behavior). */
  active?: boolean;
  /** Names of products the tenant already has — an image whose derived name matches one is skipped as a likely re-upload instead of creating a duplicate. Also catches two images in the same batch that happen to derive the same name. */
  existingNames?: string[];
}

export interface BatchDuplicateSkip {
  filename: string;
  /** The already-existing name it collided with — same string when the collision is against another item earlier in this same batch. */
  matchedName: string;
}

export interface BuildBatchDraftsResult {
  drafts: BatchProductDraft[];
  duplicates: BatchDuplicateSkip[];
}

/** Builds ready-to-insert ProductInput drafts, one per image, skipping any whose derived name already exists — never throws. */
export function buildBatchProductDrafts(input: BuildBatchDraftsInput): BuildBatchDraftsResult {
  const categoriesById = new Map(input.categories.map((c) => [c.id, c] as const));
  const audience = resolveAudience(input.category, categoriesById);
  const seenSlugs = new Set(input.existingSlugs);
  const seenNames = new Map((input.existingNames ?? []).map((n) => [normalizeForDuplicateCheck(n), n] as const));
  let referenceNumber = input.startingReferenceNumber;

  const drafts: BatchProductDraft[] = [];
  const duplicates: BatchDuplicateSkip[] = [];

  for (const item of input.items) {
    const name = deriveNameFromFilename(item.filename);
    const normalizedName = normalizeForDuplicateCheck(name);
    const existingMatch = seenNames.get(normalizedName);
    if (existingMatch) {
      duplicates.push({ filename: item.filename, matchedName: existingMatch });
      continue;
    }
    seenNames.set(normalizedName, name);

    const reference = `NS-${String(referenceNumber).padStart(3, "0")}`;
    referenceNumber += 1;

    const baseSlug = slugify(`${reference}-${name}`);
    let slug = baseSlug;
    let suffix = 2;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    seenSlugs.add(slug);

    drafts.push({
      filename: item.filename,
      input: {
        slug,
        reference,
        name,
        price: input.price ?? 0,
        previousPrice: null,
        description: "",
        categorySlug: input.category.slug,
        audience,
        images: [item.url],
        cardAspectRatio: "portrait",
        imageFit: "cover",
        sizes: [],
        colors: [],
        availability: "in_stock",
        featured: false,
        isNew: false,
        onSale: false,
        // Inactive by default — a draft with a provisional name must never
        // be visible to real customers before the tenant edits it. See
        // NSProductsTable's Activo/Inactivo filter for how they're found
        // afterward. The tenant can opt into `active: true` explicitly
        // when they trust the batch as-is (see NSProductBatchForm.tsx).
        active: input.active ?? false,
        hidePaymentBadge: false,
        stock: null,
      },
    });
  }

  return { drafts, duplicates };
}
