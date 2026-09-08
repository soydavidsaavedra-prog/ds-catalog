"use server";

import { revalidatePath } from "next/cache";
import { listCategories } from "@/lib/repositories/category-repository";
import { createProduct, listProducts } from "@/lib/repositories/product-repository";
import { getEffectivePlanForTenant } from "@/lib/tenant/plan-limits";
import { parseProductImportCsv, type ProductImportError } from "@/lib/products/csv-import";

export interface ImportProductsResult {
  imported: number;
  errors: ProductImportError[];
}

export type ImportProductsActionState = { error?: string; result?: ImportProductsResult };

/**
 * Reads the uploaded CSV, validates every row via parseProductImportCsv
 * (pure, unit-tested separately — see lib/products/csv-import.ts), then
 * inserts each valid row with a plain createProduct call. Never an
 * all-or-nothing import: a bad row is reported and skipped, every good
 * row still gets created, same as how a single manual product form only
 * ever fails the one save it's given.
 */
export async function importProductsAction(
  tenantId: string,
  tenantSlug: string,
  _prev: ImportProductsActionState,
  formData: FormData,
): Promise<ImportProductsActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo CSV." };
  }

  const csvText = await file.text();

  const [categories, existingProducts, plan] = await Promise.all([
    listCategories(tenantId),
    listProducts(tenantId),
    getEffectivePlanForTenant(tenantId),
  ]);
  const existingSlugs = new Set(existingProducts.map((p) => p.slug));

  let parsed;
  try {
    parsed = parseProductImportCsv(csvText, categories, existingSlugs);
  } catch (err) {
    console.error("[importar productos] failed to parse CSV:", err);
    return { error: "No se pudo leer el archivo. Verifica que sea un CSV separado por comas, con la primera fila de encabezados." };
  }

  let rowsToImport = parsed.rows;
  const errors = [...parsed.errors];

  if (plan?.maxProducts != null) {
    const remaining = Math.max(0, plan.maxProducts - existingProducts.length);
    if (rowsToImport.length > remaining) {
      const overflow = rowsToImport.slice(remaining);
      rowsToImport = rowsToImport.slice(0, remaining);
      for (const row of overflow) {
        errors.push({
          line: row.line,
          reason: `No importado — alcanzarías el límite de productos de tu plan (${plan.maxProducts}).`,
        });
      }
    }
  }

  let imported = 0;
  for (const row of rowsToImport) {
    try {
      await createProduct(tenantId, row.input);
      imported++;
    } catch (err) {
      console.error(`[importar productos] failed to create product from line ${row.line}:`, err);
      errors.push({ line: row.line, reason: "Error al guardar este producto. Intenta importarlo de nuevo por separado." });
    }
  }

  if (imported > 0) {
    revalidatePath(`/${tenantSlug}`);
    revalidatePath(`/${tenantSlug}/catalogo`);
    revalidatePath(`/${tenantSlug}/admin/productos`);
  }

  return { result: { imported, errors: errors.sort((a, b) => a.line - b.line) } };
}
