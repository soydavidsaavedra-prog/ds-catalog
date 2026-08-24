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
    heroEyebrow: row.hero_eyebrow,
    heroTitleLine1: row.hero_title_line1,
    heroTitleLine2: row.hero_title_line2,
    heroSubtitle: row.hero_subtitle,
    heroTagline: row.hero_tagline,
    heroCtaLabel: row.hero_cta_label,
    heroCtaHref: row.hero_cta_href,
    heroImage: row.hero_image,
    heroImagePositionX: Number(row.hero_image_position_x),
    heroImagePositionY: Number(row.hero_image_position_y),
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
  if (patch.heroEyebrow !== undefined) row.hero_eyebrow = patch.heroEyebrow;
  if (patch.heroTitleLine1 !== undefined) row.hero_title_line1 = patch.heroTitleLine1;
  if (patch.heroTitleLine2 !== undefined) row.hero_title_line2 = patch.heroTitleLine2;
  if (patch.heroSubtitle !== undefined) row.hero_subtitle = patch.heroSubtitle;
  if (patch.heroTagline !== undefined) row.hero_tagline = patch.heroTagline;
  if (patch.heroCtaLabel !== undefined) row.hero_cta_label = patch.heroCtaLabel;
  if (patch.heroCtaHref !== undefined) row.hero_cta_href = patch.heroCtaHref;
  if (patch.heroImage !== undefined) row.hero_image = patch.heroImage;
  if (patch.heroImagePositionX !== undefined) row.hero_image_position_x = patch.heroImagePositionX;
  if (patch.heroImagePositionY !== undefined) row.hero_image_position_y = patch.heroImagePositionY;
  return row;
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ns_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return fromRow(data as SettingsRow);
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_settings")
    .update(toRow(patch))
    .eq("id", 1)
    .select("*")
    .single();

  if (error) throw error;
  return fromRow(data as SettingsRow);
}
