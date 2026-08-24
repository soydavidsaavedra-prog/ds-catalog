import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { CategoryRow } from "@/lib/db/supabase-types";
import type { Category } from "@/lib/types/catalog";

export interface CategoryInput {
  slug: string;
  name: string;
  description: string;
  image: string;
  order?: number;
  active?: boolean;
  featured?: boolean;
  parentId?: string | null;
}

export interface CategoryNode extends Category {
  children: Category[];
}

function fromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    order: row.order,
    active: row.active,
    featured: row.featured,
    parentId: row.parent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCategories(opts?: { activeOnly?: boolean }): Promise<Category[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("ns_categories").select("*").order("order", { ascending: true });
  if (opts?.activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data as CategoryRow[]).map(fromRow);
}

/** Groups a flat category list into top-level categories with their subcategories nested. */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const parents = categories.filter((c) => c.parentId === null);
  return parents.map((parent) => ({
    ...parent,
    children: categories.filter((c) => c.parentId === parent.id).sort((a, b) => a.order - b.order),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ns_categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as CategoryRow) : null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ns_categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as CategoryRow) : null;
}

/** All descendant slugs of a category, including its own — for aggregating products under a parent category. */
export async function getDescendantSlugs(slug: string): Promise<string[]> {
  const all = await listCategories();
  const root = all.find((c) => c.slug === slug);
  if (!root) return [slug];
  const children = all.filter((c) => c.parentId === root.id).map((c) => c.slug);
  return [slug, ...children];
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const supabase = getSupabaseClient();
  const nextOrder = input.order ?? (await listCategories()).length + 1;

  const { data, error } = await supabase
    .from("ns_categories")
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description,
      image: input.image,
      order: nextOrder,
      active: input.active ?? true,
      featured: input.featured ?? false,
      parent_id: input.parentId ?? null,
    } satisfies Partial<CategoryRow>)
    .select("*")
    .single();

  if (error) throw error;
  return fromRow(data as CategoryRow);
}

export async function updateCategory(
  id: string,
  patch: Partial<CategoryInput>,
): Promise<Category | null> {
  const supabase = getSupabaseClient();
  const row: Partial<CategoryRow> = {};
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.image !== undefined) row.image = patch.image;
  if (patch.order !== undefined) row.order = patch.order;
  if (patch.active !== undefined) row.active = patch.active;
  if (patch.featured !== undefined) row.featured = patch.featured;
  if (patch.parentId !== undefined) row.parent_id = patch.parentId;

  const { data, error } = await supabase.from("ns_categories").update(row).eq("id", id).select("*").maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as CategoryRow) : null;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ns_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("ns_categories").update({ order: index + 1 }).eq("id", id),
    ),
  );
}
