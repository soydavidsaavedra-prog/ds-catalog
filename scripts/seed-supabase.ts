/**
 * One-time seed script: pushes the existing demo catalog (categories,
 * products, banners, settings) into a fresh Supabase project.
 *
 * Usage:
 *   1. Run supabase/schema.sql in the Supabase SQL editor first.
 *   2. Create a .env.local with NEXT_PUBLIC_SUPABASE_URL and
 *      SUPABASE_SERVICE_ROLE_KEY (see README.md).
 *   3. npm run seed:supabase
 *
 * Safe to re-run: everything is upserted by slug/id, not blindly inserted.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { categoriesSeed } from "../lib/data/seed/categories";
import { productsSeed } from "../lib/data/seed/products";
import { bannersSeed } from "../lib/data/seed/banners";
import { settingsSeed } from "../lib/data/seed/settings";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Set it in .env.local before running this script.`);
    process.exit(1);
  }
  return value;
}

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
);

async function seedCategories() {
  // categoriesSeed.id/parentId are local demo ids (e.g. "cat-dama"), not real
  // Postgres uuids — parents are upserted first (without id/parent_id, so
  // Postgres generates the real uuid), then children are upserted with
  // parent_id resolved to that real uuid via the parent's slug.
  const parents = categoriesSeed.filter((c) => c.parentId === null);
  const children = categoriesSeed.filter((c) => c.parentId !== null);

  const parentRows = parents.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    order: c.order,
    active: c.active,
    featured: c.featured,
    parent_id: null,
  }));

  const { data: insertedParents, error: parentError } = await supabase
    .from("ns_categories")
    .upsert(parentRows, { onConflict: "slug" })
    .select("id, slug");
  if (parentError) throw parentError;

  const realIdBySlug = new Map((insertedParents ?? []).map((row) => [row.slug, row.id]));
  const localIdToSlug = new Map(parents.map((p) => [p.id, p.slug]));

  const childRows = children.map((c) => {
    const parentSlug = localIdToSlug.get(c.parentId!);
    const parentRealId = parentSlug ? realIdBySlug.get(parentSlug) : undefined;
    if (!parentRealId) throw new Error(`No pude resolver el id real del padre de "${c.slug}"`);

    return {
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
      order: c.order,
      active: c.active,
      featured: c.featured,
      parent_id: parentRealId,
    };
  });

  const { error: childError } = await supabase.from("ns_categories").upsert(childRows, { onConflict: "slug" });
  if (childError) throw childError;

  console.log(`✓ ${parentRows.length + childRows.length} categorías (${parentRows.length} principales, ${childRows.length} subcategorías)`);
}

async function seedProducts() {
  const rows = productsSeed.map((p) => ({
    slug: p.slug,
    reference: p.reference,
    name: p.name,
    price: p.price,
    wholesale_price: p.wholesalePrice,
    description: p.description,
    category_slug: p.categorySlug,
    audience: p.audience,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    availability: p.availability,
    featured: p.featured,
    is_new: p.isNew,
    on_sale: p.onSale,
    active: p.active,
    hide_payment_badge: p.hidePaymentBadge,
  }));

  const { error } = await supabase.from("ns_products").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ ${rows.length} productos`);
}

async function seedBanners() {
  const rows = bannersSeed.map((b) => ({
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    cta_label: b.ctaLabel,
    cta_href: b.ctaHref,
    active: b.active,
    order: b.order,
  }));

  const { error } = await supabase.from("ns_banners").insert(rows);
  if (error && error.code !== "23505") throw error; // ignore duplicate-key on re-run
  console.log(`✓ ${rows.length} banners (o ya existían)`);
}

async function seedSettings() {
  const { error } = await supabase
    .from("ns_settings")
    .upsert(
      {
        id: 1,
        brand_name: settingsSeed.brandName,
        slogan: settingsSeed.slogan,
        brand_description: settingsSeed.brandDescription,
        whatsapp_number: settingsSeed.whatsappNumber,
        whatsapp_display: settingsSeed.whatsappDisplay,
        contact_email: settingsSeed.contactEmail,
        contact_address: settingsSeed.contactAddress,
        contact_maps_url: settingsSeed.contactMapsUrl,
        currency: settingsSeed.currency,
        instagram: settingsSeed.instagram,
        facebook: settingsSeed.facebook,
        tiktok: settingsSeed.tiktok,
        hero_eyebrow: settingsSeed.heroEyebrow,
        hero_title_line1: settingsSeed.heroTitleLine1,
        hero_title_line2: settingsSeed.heroTitleLine2,
        hero_subtitle: settingsSeed.heroSubtitle,
        hero_tagline: settingsSeed.heroTagline,
        hero_cta_label: settingsSeed.heroCtaLabel,
        hero_cta_href: settingsSeed.heroCtaHref,
        hero_image: settingsSeed.heroImage,
        hero_image_position_x: settingsSeed.heroImagePositionX,
        hero_image_position_y: settingsSeed.heroImagePositionY,
        brand_logo: settingsSeed.brandLogo,
        payment_badge_icon: settingsSeed.paymentBadgeIcon,
        payment_badge_label: settingsSeed.paymentBadgeLabel,
        story_eyebrow: settingsSeed.storyEyebrow,
        story_title: settingsSeed.storyTitle,
        story_description: settingsSeed.storyDescription,
        story_step_image1: settingsSeed.storyStepImage1,
        story_step_image2: settingsSeed.storyStepImage2,
        story_step_image3: settingsSeed.storyStepImage3,
        story_step_image4: settingsSeed.storyStepImage4,
        story_step_image5: settingsSeed.storyStepImage5,
        statement_title_line1: settingsSeed.statementTitleLine1,
        statement_title_line2: settingsSeed.statementTitleLine2,
        statement_description: settingsSeed.statementDescription,
        statement_image: settingsSeed.statementImage,
      },
      { onConflict: "id" },
    );
  if (error) throw error;
  console.log("✓ configuración");
}

async function main() {
  console.log("Sembrando catálogo de demo en Supabase...");
  await seedCategories();
  await seedProducts();
  await seedBanners();
  await seedSettings();
  console.log("Listo.");
}

main().catch((err) => {
  console.error("Error al sembrar:", err);
  process.exit(1);
});
