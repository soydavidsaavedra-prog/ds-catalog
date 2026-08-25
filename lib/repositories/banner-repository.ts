import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { BannerRow } from "@/lib/db/supabase-types";
import type { Banner } from "@/lib/types/catalog";

export type BannerInput = Omit<Banner, "id">;

function fromRow(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    active: row.active,
    order: row.order,
  };
}

function toRow(input: Partial<BannerInput>): Partial<BannerRow> {
  const row: Partial<BannerRow> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.subtitle !== undefined) row.subtitle = input.subtitle;
  if (input.image !== undefined) row.image = input.image;
  if (input.ctaLabel !== undefined) row.cta_label = input.ctaLabel;
  if (input.ctaHref !== undefined) row.cta_href = input.ctaHref;
  if (input.active !== undefined) row.active = input.active;
  if (input.order !== undefined) row.order = input.order;
  return row;
}

export async function listBanners(tenantId: string, opts?: { activeOnly?: boolean }): Promise<Banner[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("ns_banners").select("*").eq("tenant_id", tenantId).order("order", { ascending: true });
  if (opts?.activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data as BannerRow[]).map(fromRow);
}

export async function getBannerById(tenantId: string, id: string): Promise<Banner | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_banners")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as BannerRow) : null;
}

export async function createBanner(tenantId: string, input: BannerInput): Promise<Banner> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_banners")
    .insert({ ...toRow(input), tenant_id: tenantId })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as BannerRow);
}

export async function updateBanner(
  tenantId: string,
  id: string,
  patch: Partial<BannerInput>,
): Promise<Banner | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_banners")
    .update(toRow(patch))
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as BannerRow) : null;
}

export async function deleteBanner(tenantId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ns_banners").delete().eq("tenant_id", tenantId).eq("id", id);
  if (error) throw error;
}
