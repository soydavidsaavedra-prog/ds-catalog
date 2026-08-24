import "server-only";
import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/db/jsonStore";
import { categoriesSeed } from "@/lib/data/seed/categories";
import type { Category } from "@/lib/types/catalog";

const store = createJsonStore<Category[]>("categories", categoriesSeed);

export interface CategoryInput {
  slug: string;
  name: string;
  description: string;
  image: string;
  order?: number;
  active?: boolean;
  featured?: boolean;
}

export async function listCategories(opts?: { activeOnly?: boolean }): Promise<Category[]> {
  const categories = await store.read();
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  return opts?.activeOnly ? sorted.filter((c) => c.active) : sorted;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await store.read();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await store.read();
  return categories.find((c) => c.id === id) ?? null;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const categories = await store.read();
  const now = new Date().toISOString();
  const category: Category = {
    id: randomUUID(),
    slug: input.slug,
    name: input.name,
    description: input.description,
    image: input.image,
    order: input.order ?? categories.length + 1,
    active: input.active ?? true,
    featured: input.featured ?? false,
    createdAt: now,
    updatedAt: now,
  };
  await store.write([...categories, category]);
  return category;
}

export async function updateCategory(
  id: string,
  patch: Partial<CategoryInput>,
): Promise<Category | null> {
  const categories = await store.read();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updated: Category = {
    ...categories[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const next = [...categories];
  next[index] = updated;
  await store.write(next);
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await store.read();
  await store.write(categories.filter((c) => c.id !== id));
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const categories = await store.read();
  const next = categories.map((c) => {
    const position = orderedIds.indexOf(c.id);
    return position === -1 ? c : { ...c, order: position + 1 };
  });
  await store.write(next);
}
