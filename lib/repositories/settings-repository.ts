import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SettingsRow } from "@/lib/db/supabase-types";
import type { SiteSettings } from "@/lib/types/catalog";

function fromRow(row: SettingsRow): SiteSettings {
  return {
    brandName: row.brand_name,
    slogan: row.slogan,
    whatsappNumber: row.whatsapp_number,
    currency: row.currency,
    instagram: row.instagram,
    facebook: row.facebook,
    tiktok: row.tiktok,
  };
}

function toRow(patch: Partial<SiteSettings>): Partial<SettingsRow> {
  const row: Partial<SettingsRow> = {};
  if (patch.brandName !== undefined) row.brand_name = patch.brandName;
  if (patch.slogan !== undefined) row.slogan = patch.slogan;
  if (patch.whatsappNumber !== undefined) row.whatsapp_number = patch.whatsappNumber;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.instagram !== undefined) row.instagram = patch.instagram;
  if (patch.facebook !== undefined) row.facebook = patch.facebook;
  if (patch.tiktok !== undefined) row.tiktok = patch.tiktok;
  return row;
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return fromRow(data as SettingsRow);
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("settings")
    .update(toRow(patch))
    .eq("id", 1)
    .select("*")
    .single();

  if (error) throw error;
  return fromRow(data as SettingsRow);
}
