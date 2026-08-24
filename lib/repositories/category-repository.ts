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
  const { data, error } = await supabase
    .from("ns_categories")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

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
