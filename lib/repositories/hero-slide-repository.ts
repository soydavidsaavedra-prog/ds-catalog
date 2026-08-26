import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { HeroSlideRow } from "@/lib/db/supabase-types";
import type { HeroSlide } from "@/lib/types/catalog";

export type HeroSlideInput = Omit<HeroSlide, "id">;

function fromRow(row: HeroSlideRow): HeroSlide {
  return {
    id: row.id,
    mediaType: row.media_type,
    mediaUrl: row.media_url,
    positionX: row.position_x,
    positionY: row.position_y,
    order: row.order,
    active: row.active,
  };
}

function toRow(input: Partial<HeroSlideInput>): Partial<HeroSlideRow> {
  const row: Partial<HeroSlideRow> = {};
  if (input.mediaType !== undefined) row.media_type = input.mediaType;
  if (input.mediaUrl !== undefined) row.media_url = input.mediaUrl;
  if (input.positionX !== undefined) row.position_x = input.positionX;
  if (input.positionY !== undefined) row.position_y = input.positionY;
  if (input.order !== undefined) row.order = input.order;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export async function listHeroSlides(tenantId: string, opts?: { activeOnly?: boolean }): Promise<HeroSlide[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("ns_hero_slides").select("*").eq("tenant_id", tenantId).order("order", { ascending: true });
  if (opts?.activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data as HeroSlideRow[]).map(fromRow);
}

export async function getHeroSlideById(tenantId: string, id: string): Promise<HeroSlide | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_hero_slides")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as HeroSlideRow) : null;
}

export async function createHeroSlide(tenantId: string, input: HeroSlideInput): Promise<HeroSlide> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_hero_slides")
    .insert({ ...toRow(input), tenant_id: tenantId })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as HeroSlideRow);
}

export async function updateHeroSlide(
  tenantId: string,
  id: string,
  patch: Partial<HeroSlideInput>,
): Promise<HeroSlide | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_hero_slides")
    .update(toRow(patch))
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as HeroSlideRow) : null;
}

export async function deleteHeroSlide(tenantId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ns_hero_slides").delete().eq("tenant_id", tenantId).eq("id", id);
  if (error) throw error;
}
