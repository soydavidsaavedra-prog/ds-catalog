import "server-only";
import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/db/jsonStore";
import { productsSeed } from "@/lib/data/seed/products";
import type { Product } from "@/lib/types/catalog";

const store = createJsonStore<Product[]>("products", productsSeed);

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export async function listProducts(opts?: { activeOnly?: boolean }): Promise<Product[]> {
  const products = await store.read();
  return opts?.activeOnly ? products.filter((p) => p.active) : products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await store.read();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await store.read();
  return products.find((p) => p.id === id) ?? null;
}

export async function getProductsByCategory(
  categorySlug: string,
  opts?: { activeOnly?: boolean },
): Promise<Product[]> {
  const products = await listProducts(opts);
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await listProducts({ activeOnly: true });
  return products
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, limit);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const products = await store.read();
  const now = new Date().toISOString();
  const product: Product = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  await store.write([product, ...products]);
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductInput>,
): Promise<Product | null> {
  const products = await store.read();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Product = { ...products[index], ...patch, updatedAt: new Date().toISOString() };
  const next = [...products];
  next[index] = updated;
  await store.write(next);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await store.read();
  await store.write(products.filter((p) => p.id !== id));
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const products = await store.read();
  return products.some((p) => p.slug === slug && p.id !== excludeId);
}
