"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { catalogEngine } from "@/engines/catalog/catalog.engine";
import type { Product } from "@/types/product";

export async function createProduct(product: Product) {
  await catalogEngine.createProduct(product);

  revalidatePath("/admin/products");

  redirect("/admin/products");
}

export async function updateProduct(product: Product) {
  await catalogEngine.updateProduct(product);

  revalidatePath("/admin/products");
  revalidatePath(`/product/${product.slug}`);

  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await catalogEngine.deleteProduct(id);

  revalidatePath("/admin/products");

  redirect("/admin/products");
}