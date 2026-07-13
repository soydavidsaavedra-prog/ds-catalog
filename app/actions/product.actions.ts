"use server";

import { revalidatePath } from "next/cache";

import { catalogEngine } from "@/engines/catalog/catalog.engine";
import type { Product } from "@/types/product";

export async function updateProduct(
  product: Product
) {
  catalogEngine.updateProduct(product);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${product.id}/edit`);
  revalidatePath(`/product/${product.slug}`);
}