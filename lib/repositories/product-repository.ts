import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { ProductRow } from "@/lib/db/supabase-types";
import type { Product } from "@/lib/types/catalog";

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference,
    name: row.name,
    price: Number(row.price),
    wholesalePrice: row.wholesale_price === null ? null : Number(row.wholesale_price),
    description: row.description,
    categorySlug: row.category_slug,
    audience: row.audience,
    images: row.images ?? [],
    cardAspectRatio: row.card_aspect_ratio,
    imageFit: row.image_fit,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    availability: row.availability,
    featured: row.featured,
    isNew: row.is_new,
    onSale: row.on_sale,
    active: row.active,
    hidePaymentBadge: row.hide_payment_badge,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: Partial<ProductInput>): Partial<ProductRow> {
  const row: Partial<ProductRow> = {};
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.reference !== undefined) row.reference = input.reference;
  if (input.name !== undefined) row.name = input.name;
  if (input.price !== undefined) row.price = input.price;
  if (input.wholesalePrice !== undefined) row.wholesale_price = input.wholesalePrice;
  if (input.description !== undefined) row.description = input.description;
  if (input.categorySlug !== undefined) row.category_slug = input.categorySlug;
  if (input.audience !== undefined) row.audience = input.audience;
  if (input.images !== undefined) row.images = input.images;
  if (input.cardAspectRatio !== undefined) row.card_aspect_ratio = input.cardAspectRatio;
  if (input.imageFit !== undefined) row.image_fit = input.imageFit;
  if (input.sizes !== undefined) row.sizes = input.sizes;
  if (input.colors !== undefined) row.colors = input.colors;
  if (input.availability !== undefined) row.availability = input.availability;
  if (input.featured !== undefined) row.featured = input.featured;
  if (input.isNew !== undefined) row.is_new = input.isNew;
  if (input.onSale !== undefined) row.on_sale = input.onSale;
  if (input.active !== undefined) row.active = input.active;
  if (input.hidePaymentBadge !== undefined) row.hide_payment_badge = input.hidePaymentBadge;
  return row;
}

export async function listProducts(tenantId: string, opts?: { activeOnly?: boolean }): Promise<Product[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("ns_products")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (opts?.activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data as ProductRow[]).map(fromRow);
}

/** Used by createProductAction to check against the tenant's plan.maxProducts — a head-only count, not a full row fetch. */
export async function countProducts(tenantId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from("ns_products")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  if (error) throw error;
  return count ?? 0;
}

export async function getProductBySlug(tenantId: string, slug: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as ProductRow) : null;
}

export async function getProductById(tenantId: string, id: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as ProductRow) : null;
}

export async function getProductsByCategory(
  tenantId: string,
  categorySlug: string,
  opts?: { activeOnly?: boolean },
): Promise<Product[]> {
  const products = await listProducts(tenantId, opts);
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getRelatedProducts(tenantId: string, product: Product, limit = 4): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("category_slug", product.categorySlug)
    .eq("active", true)
    .neq("id", product.id)
    .limit(limit);

  if (error) throw error;
  return (data as ProductRow[]).map(fromRow);
}

export async function createProduct(tenantId: string, input: ProductInput): Promise<Product> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_products")
    .insert({ ...toRow(input), tenant_id: tenantId })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as ProductRow);
}

export async function updateProduct(
  tenantId: string,
  id: string,
  patch: Partial<ProductInput>,
): Promise<Product | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_products")
    .update(toRow(patch))
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as ProductRow) : null;
}

export async function deleteProduct(tenantId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ns_products").delete().eq("tenant_id", tenantId).eq("id", id);
  if (error) throw error;
}

export async function getNextReference(tenantId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ns_products").select("reference").eq("tenant_id", tenantId);
  if (error) throw error;

  const max = (data as { reference: string }[]).reduce((highest, { reference }) => {
    const match = /^NS-(\d+)$/.exec(reference.trim());
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);

  return `NS-${String(max + 1).padStart(3, "0")}`;
}

export async function isSlugTaken(tenantId: string, slug: string, excludeId?: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("ns_products")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);

  const { count, error } = await query;
  if (error) throw error;
  return (count ?? 0) > 0;
}
