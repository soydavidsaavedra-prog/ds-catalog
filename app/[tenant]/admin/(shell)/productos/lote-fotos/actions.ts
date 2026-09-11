"use server";

import { revalidatePath } from "next/cache";
import { createProduct, getNextReference, listProducts } from "@/lib/repositories/product-repository";
import { listCategories, getCategoryBySlug } from "@/lib/repositories/category-repository";
import { getEffectivePlanForTenant } from "@/lib/tenant/plan-limits";
import { buildBatchProductDrafts, MAX_BATCH_IMAGES, type BatchImageItem } from "@/lib/products/image-batch";

export interface ProductBatchError {
  filename: string;
  reason: string;
}

export interface ProductBatchResult {
  created: number;
  errors: ProductBatchError[];
}

/**
 * Creates one INACTIVE (draft) product per already-uploaded image — the
 * client (NSProductBatchForm.tsx) has already uploaded every file to
 * Storage via /admin/api/upload before calling this, since a Server
 * Action's FormData round-trip isn't where file uploads for THIS feature
 * happen (unlike the CSV import, which never uploads anything). Called
 * directly as a function from that client component, not via a <form
 * action> — there's no native form submission to hook into once the
 * uploads already happened client-side.
 *
 * Never all-or-nothing: mirrors importProductsAction's philosophy
 * (app/[tenant]/admin/(shell)/productos/importar/actions.ts) — a failure
 * on one item is reported and skipped, every other item still gets
 * created.
 */
export async function createProductBatchAction(
  tenantId: string,
  tenantSlug: string,
  categorySlug: string,
  items: BatchImageItem[],
  options?: { price?: number; active?: boolean },
): Promise<ProductBatchResult> {
  const errors: ProductBatchError[] = [];
  let itemsToCreate = items;

  if (itemsToCreate.length > MAX_BATCH_IMAGES) {
    for (const overflow of itemsToCreate.slice(MAX_BATCH_IMAGES)) {
      errors.push({ filename: overflow.filename, reason: `No creado — máximo ${MAX_BATCH_IMAGES} productos por lote.` });
    }
    itemsToCreate = itemsToCreate.slice(0, MAX_BATCH_IMAGES);
  }

  const category = await getCategoryBySlug(tenantId, categorySlug);
  if (!category) {
    return { created: 0, errors: items.map((i) => ({ filename: i.filename, reason: "Categoría no válida." })) };
  }

  const [categories, existingProducts, plan, nextReference] = await Promise.all([
    listCategories(tenantId),
    listProducts(tenantId),
    getEffectivePlanForTenant(tenantId),
    getNextReference(tenantId),
  ]);
  const startingReferenceNumber = Number(/^NS-(\d+)$/.exec(nextReference)?.[1] ?? "1");
  const existingSlugs = new Set(existingProducts.map((p) => p.slug));

  if (plan?.maxProducts != null) {
    const remaining = Math.max(0, plan.maxProducts - existingProducts.length);
    if (itemsToCreate.length > remaining) {
      const overflow = itemsToCreate.slice(remaining);
      itemsToCreate = itemsToCreate.slice(0, remaining);
      for (const item of overflow) {
        errors.push({
          filename: item.filename,
          reason: `No creado — alcanzarías el límite de productos de tu plan (${plan.maxProducts}).`,
        });
      }
    }
  }

  const { drafts, duplicates } = buildBatchProductDrafts({
    items: itemsToCreate,
    category,
    categories,
    startingReferenceNumber,
    existingSlugs,
    price: options?.price,
    active: options?.active,
    existingNames: existingProducts.map((p) => p.name),
  });
  for (const dup of duplicates) {
    errors.push({ filename: dup.filename, reason: `Ya existe un producto llamado "${dup.matchedName}" — no se creó de nuevo.` });
  }

  let created = 0;
  for (const draft of drafts) {
    try {
      await createProduct(tenantId, draft.input);
      created++;
    } catch (err) {
      console.error(`[lote de fotos] failed to create product from ${draft.filename}:`, err);
      errors.push({ filename: draft.filename, reason: "Error al guardar este producto." });
    }
  }

  if (created > 0) {
    revalidatePath(`/${tenantSlug}/admin/productos`);
    if (options?.active) {
      // Unlike the default (inactive) path, these drafts are visible to
      // real customers immediately — the storefront pages need refreshing too.
      revalidatePath(`/${tenantSlug}`);
      revalidatePath(`/${tenantSlug}/catalogo`);
      revalidatePath(`/${tenantSlug}/${categorySlug}`);
    }
  }

  return { created, errors };
}
