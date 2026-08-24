import "server-only";
import { cache } from "react";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SettingsRow } from "@/lib/db/supabase-types";
import type { SiteSettings } from "@/lib/types/catalog";

function fromRow(row: SettingsRow): SiteSettings {
  return {
    brandName: row.brand_name,
    slogan: row.slogan,
    brandDescription: row.brand_description,
    whatsappNumber: row.whatsapp_number,
    whatsappDisplay: row.whatsapp_display,
    contactEmail: row.contact_email,
    contactAddress: row.contact_address,
    contactMapsUrl: row.contact_maps_url,
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
    brandLogo: row.brand_logo,
    paymentBadgeIcon: row.payment_badge_icon,
    paymentBadgeLabel: row.payment_badge_label,
    storyEyebrow: row.story_eyebrow,
    storyTitle: row.story_title,
    storyDescription: row.story_description,
    storyStepImage1: row.story_step_image1,
    storyStepImage2: row.story_step_image2,
    storyStepImage3: row.story_step_image3,
    storyStepImage4: row.story_step_image4,
    storyStepImage5: row.story_step_image5,
  };
}

function toRow(patch: Partial<SiteSettings>): Partial<SettingsRow> {
  const row: Partial<SettingsRow> = {};
  if (patch.brandName !== undefined) row.brand_name = patch.brandName;
  if (patch.slogan !== undefined) row.slogan = patch.slogan;
  if (patch.brandDescription !== undefined) row.brand_description = patch.brandDescription;
  if (patch.whatsappNumber !== undefined) row.whatsapp_number = patch.whatsappNumber;
  if (patch.whatsappDisplay !== undefined) row.whatsapp_display = patch.whatsappDisplay;
  if (patch.contactEmail !== undefined) row.contact_email = patch.contactEmail;
  if (patch.contactAddress !== undefined) row.contact_address = patch.contactAddress;
  if (patch.contactMapsUrl !== undefined) row.contact_maps_url = patch.contactMapsUrl;
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
  if (patch.brandLogo !== undefined) row.brand_logo = patch.brandLogo;
  if (patch.paymentBadgeIcon !== undefined) row.payment_badge_icon = patch.paymentBadgeIcon;
  if (patch.paymentBadgeLabel !== undefined) row.payment_badge_label = patch.paymentBadgeLabel;
  if (patch.storyEyebrow !== undefined) row.story_eyebrow = patch.storyEyebrow;
  if (patch.storyTitle !== undefined) row.story_title = patch.storyTitle;
  if (patch.storyDescription !== undefined) row.story_description = patch.storyDescription;
  if (patch.storyStepImage1 !== undefined) row.story_step_image1 = patch.storyStepImage1;
  if (patch.storyStepImage2 !== undefined) row.story_step_image2 = patch.storyStepImage2;
  if (patch.storyStepImage3 !== undefined) row.story_step_image3 = patch.storyStepImage3;
  if (patch.storyStepImage4 !== undefined) row.story_step_image4 = patch.storyStepImage4;
  if (patch.storyStepImage5 !== undefined) row.story_step_image5 = patch.storyStepImage5;
  return row;
}

/**
 * Wrapped in React's cache() so the many components that need settings
 * (header, footer, hero, every product card for the payment badge, ...)
 * share a single Supabase round-trip per request instead of one each.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ns_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return fromRow(data as SettingsRow);
});

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
