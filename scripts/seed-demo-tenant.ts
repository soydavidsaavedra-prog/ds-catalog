/**
 * Seeds a second, independent tenant ("Demo Store", slug "demo") with a
 * small set of made-up data — never El Nuevo Sánchez's real catalog — so
 * multi-tenant isolation can be verified end to end: /demo must show only
 * this data, /elnuevosanchez must keep showing only its own.
 *
 * Usage (after supabase/schema.sql has been run at least once):
 *   npm run seed:demo-tenant
 *
 * Safe to re-run: everything is upserted by (tenant_id, slug) / tenant_id.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const TENANT_SLUG = "demo";
const TENANT_NAME = "Demo Store";

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

async function ensureTenant(): Promise<string> {
  const { error: upsertError } = await supabase
    .from("ds_tenants")
    .upsert({ slug: TENANT_SLUG, name: TENANT_NAME, status: "active" }, { onConflict: "slug", ignoreDuplicates: true });
  if (upsertError) throw upsertError;

  const { data, error } = await supabase.from("ds_tenants").select("id").eq("slug", TENANT_SLUG).single();
  if (error) throw error;
  console.log(`✓ tenant "${TENANT_SLUG}" (${data.id})`);
  return data.id as string;
}

async function seedCategories(tenantId: string) {
  const rows = [
    {
      tenant_id: tenantId,
      slug: "ropa",
      name: "Ropa",
      description: "Prendas de la tienda de prueba.",
      image: "placeholder:demo:ropa",
      order: 1,
      active: true,
      featured: true,
      parent_id: null,
    },
    {
      tenant_id: tenantId,
      slug: "accesorios",
      name: "Accesorios",
      description: "Accesorios de la tienda de prueba.",
      image: "placeholder:demo:accesorios",
      order: 2,
      active: true,
      featured: true,
      parent_id: null,
    },
  ];
  const { error } = await supabase.from("ns_categories").upsert(rows, { onConflict: "tenant_id,slug" });
  if (error) throw error;
  console.log(`✓ ${rows.length} categorías`);
}

async function seedProducts(tenantId: string) {
  const rows = [
    {
      tenant_id: tenantId,
      slug: "camisa-demo",
      reference: "DEMO-001",
      name: "Camisa de prueba",
      price: 19.99,
      wholesale_price: null,
      description: "Producto de ejemplo para verificar el aislamiento entre tenants.",
      category_slug: "ropa",
      audience: "unisex",
      images: ["placeholder:ropa:camisa-demo"],
      sizes: ["S", "M", "L"],
      colors: [{ name: "Azul", hex: "#3f628a" }],
      availability: "in_stock",
      featured: true,
      is_new: true,
      on_sale: false,
      active: true,
      hide_payment_badge: false,
    },
    {
      tenant_id: tenantId,
      slug: "pantalon-demo",
      reference: "DEMO-002",
      name: "Pantalón de prueba",
      price: 29.99,
      wholesale_price: null,
      description: "Producto de ejemplo para verificar el aislamiento entre tenants.",
      category_slug: "ropa",
      audience: "unisex",
      images: ["placeholder:ropa:pantalon-demo"],
      sizes: ["28", "30", "32"],
      colors: [{ name: "Negro", hex: "#111111" }],
      availability: "in_stock",
      featured: false,
      is_new: false,
      on_sale: true,
      active: true,
      hide_payment_badge: false,
    },
    {
      tenant_id: tenantId,
      slug: "gorra-demo",
      reference: "DEMO-003",
      name: "Gorra de prueba",
      price: 9.99,
      wholesale_price: null,
      description: "Producto de ejemplo para verificar el aislamiento entre tenants.",
      category_slug: "accesorios",
      audience: "unisex",
      images: ["placeholder:accesorios:gorra-demo"],
      sizes: [],
      colors: [{ name: "Gris", hex: "#888888" }],
      availability: "low_stock",
      featured: true,
      is_new: false,
      on_sale: false,
      active: true,
      hide_payment_badge: true,
    },
  ];
  const { error } = await supabase.from("ns_products").upsert(rows, { onConflict: "tenant_id,slug" });
  if (error) throw error;
  console.log(`✓ ${rows.length} productos`);
}

async function seedBanner(tenantId: string) {
  const { count, error: countError } = await supabase
    .from("ns_banners")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    console.log(`✓ banner ya existía`);
    return;
  }

  const { error } = await supabase.from("ns_banners").insert({
    tenant_id: tenantId,
    title: "Tienda de prueba",
    subtitle: "Datos de ejemplo, no reales",
    image: "placeholder:demo:banner",
    cta_label: "Ver catálogo",
    cta_href: "/catalogo",
    active: true,
    order: 1,
  });
  if (error) throw error;
  console.log("✓ 1 banner");
}

async function seedSettings(tenantId: string) {
  // Deliberately different copy/config from elnuevosanchez, so the two
  // tenants are visibly distinguishable — see docs/ARCHITECTURE.md for
  // why full color/typography theming per tenant isn't wired up yet
  // (colors and fonts are still compile-time Tailwind tokens shared by
  // every tenant; only textual content and images vary per tenant today).
  const { error } = await supabase
    .from("ns_settings")
    .upsert(
      {
        tenant_id: tenantId,
        brand_name: "Demo Store",
        slogan: "Tienda de demostración",
        brand_description: "Catálogo de ejemplo usado para probar el motor multi-tenant de DS Catalog.",
        whatsapp_number: "10000000000",
        whatsapp_display: "+1 000 000 0000",
        contact_email: "demo@ds-catalog.example",
        contact_address: "",
        contact_maps_url: "",
        currency: "USD",
        instagram: "",
        facebook: "",
        tiktok: "",
        hero_eyebrow: "Catálogo de ejemplo",
        hero_title_line1: "Demo",
        hero_title_line2: "Store",
        hero_subtitle: "Tienda de prueba",
        hero_tagline: "Datos de ejemplo",
        hero_cta_label: "Ver catálogo",
        hero_cta_href: "/catalogo",
        hero_image: "placeholder:demo:hero",
        hero_image_position_x: 50,
        hero_image_position_y: 50,
        brand_logo: "",
        payment_badge_icon: "",
        payment_badge_label: "",
        story_eyebrow: "Cómo funciona",
        story_title: "Del panel a tu catálogo",
        story_description: "Este texto se administra desde /demo/admin/inicio, igual que en cualquier otro tenant.",
        story_step_image1: "placeholder:demo:story-1",
        story_step_image2: "placeholder:demo:story-2",
        story_step_image3: "placeholder:demo:story-3",
        story_step_image4: "placeholder:demo:story-4",
        story_step_image5: "placeholder:demo:story-5",
        statement_title_line1: "Demo is",
        statement_title_line2: "just a test",
        statement_description: "Sección editable desde el panel — contenido de ejemplo, no real.",
        statement_image: "placeholder:demo:statement",
      },
      { onConflict: "tenant_id" },
    );
  if (error) throw error;
  console.log("✓ configuración");
}

async function main() {
  console.log(`Sembrando datos mínimos de prueba para "${TENANT_SLUG}" en Supabase...`);
  const tenantId = await ensureTenant();
  await seedCategories(tenantId);
  await seedProducts(tenantId);
  await seedBanner(tenantId);
  await seedSettings(tenantId);
  console.log("Listo. Visita /demo (y /demo/admin) para verificarlo.");
}

main().catch((err) => {
  console.error("Error al sembrar:", err);
  process.exit(1);
});
