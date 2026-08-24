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
  const rows = categoriesSeed.map((c) => ({
    id: c.id.startsWith("cat-") ? undefined : c.id, // let Postgres generate a real uuid for the demo string ids
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    order: c.order,
    active: c.active,
    featured: c.featured,
  }));

  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ ${rows.length} categorías`);
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
  }));

  const { error } = await supabase.from("products").upsert(rows, { onConflict: "slug" });
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

  const { error } = await supabase.from("banners").insert(rows);
  if (error && error.code !== "23505") throw error; // ignore duplicate-key on re-run
  console.log(`✓ ${rows.length} banners (o ya existían)`);
}

async function seedSettings() {
  const { error } = await supabase
    .from("settings")
    .upsert(
      {
        id: 1,
        brand_name: settingsSeed.brandName,
        slogan: settingsSeed.slogan,
        whatsapp_number: settingsSeed.whatsappNumber,
        currency: settingsSeed.currency,
        instagram: settingsSeed.instagram,
        facebook: settingsSeed.facebook,
        tiktok: settingsSeed.tiktok,
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
