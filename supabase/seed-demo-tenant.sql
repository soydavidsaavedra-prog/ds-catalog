-- DS Catalog — seed the "Demo Store" tenant (slug: demo)
-- SQL equivalent of scripts/seed-demo-tenant.ts, for pasting directly into
-- the Supabase SQL Editor — same minimal, synthetic dataset (2 categories,
-- 3 products, 1 banner, distinct settings), never El Nuevo Sánchez's real
-- catalog. Safe to re-run: every insert is an upsert keyed by
-- (tenant_id, slug) / tenant_id, matching the unique constraints added in
-- the multi-tenant migration.
--
-- Requires supabase/schema.sql (multi-tenant version) to already be
-- applied — this only inserts rows, it does not touch table structure.

begin;

-- ---------- tenant ----------

insert into ds_tenants (slug, name, status)
values ('demo', 'Demo Store', 'active')
on conflict (slug) do nothing;

-- ---------- categories ----------

insert into ns_categories (tenant_id, slug, name, description, image, "order", active, featured, parent_id)
values
  (
    (select id from ds_tenants where slug = 'demo'),
    'ropa', 'Ropa', 'Prendas de la tienda de prueba.', 'placeholder:demo:ropa',
    1, true, true, null
  ),
  (
    (select id from ds_tenants where slug = 'demo'),
    'accesorios', 'Accesorios', 'Accesorios de la tienda de prueba.', 'placeholder:demo:accesorios',
    2, true, true, null
  )
on conflict (tenant_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "order" = excluded."order",
  active = excluded.active,
  featured = excluded.featured;

-- ---------- products ----------

insert into ns_products (
  tenant_id, slug, reference, name, price, wholesale_price, description,
  category_slug, audience, images, sizes, colors, availability,
  featured, is_new, on_sale, active, hide_payment_badge
)
values
  (
    (select id from ds_tenants where slug = 'demo'),
    'camisa-demo', 'DEMO-001', 'Camisa de prueba', 19.99, null,
    'Producto de ejemplo para verificar el aislamiento entre tenants.',
    'ropa', 'unisex',
    array['placeholder:ropa:camisa-demo'],
    array['S', 'M', 'L'],
    '[{"name": "Azul", "hex": "#3f628a"}]'::jsonb,
    'in_stock', true, true, false, true, false
  ),
  (
    (select id from ds_tenants where slug = 'demo'),
    'pantalon-demo', 'DEMO-002', 'Pantalón de prueba', 29.99, null,
    'Producto de ejemplo para verificar el aislamiento entre tenants.',
    'ropa', 'unisex',
    array['placeholder:ropa:pantalon-demo'],
    array['28', '30', '32'],
    '[{"name": "Negro", "hex": "#111111"}]'::jsonb,
    'in_stock', false, false, true, true, false
  ),
  (
    (select id from ds_tenants where slug = 'demo'),
    'gorra-demo', 'DEMO-003', 'Gorra de prueba', 9.99, null,
    'Producto de ejemplo para verificar el aislamiento entre tenants.',
    'accesorios', 'unisex',
    array['placeholder:accesorios:gorra-demo'],
    array[]::text[],
    '[{"name": "Gris", "hex": "#888888"}]'::jsonb,
    'low_stock', true, false, false, true, true
  )
on conflict (tenant_id, slug) do update set
  reference = excluded.reference,
  name = excluded.name,
  price = excluded.price,
  wholesale_price = excluded.wholesale_price,
  description = excluded.description,
  category_slug = excluded.category_slug,
  audience = excluded.audience,
  images = excluded.images,
  sizes = excluded.sizes,
  colors = excluded.colors,
  availability = excluded.availability,
  featured = excluded.featured,
  is_new = excluded.is_new,
  on_sale = excluded.on_sale,
  active = excluded.active,
  hide_payment_badge = excluded.hide_payment_badge;

-- ---------- banner ----------
-- Only inserted the first time (no natural unique key to upsert on, same
-- as scripts/seed-demo-tenant.ts) — skipped if the demo tenant already has
-- any banner, so re-running this script never creates duplicates.

insert into ns_banners (tenant_id, title, subtitle, image, cta_label, cta_href, active, "order")
select
  (select id from ds_tenants where slug = 'demo'),
  'Tienda de prueba', 'Datos de ejemplo, no reales', 'placeholder:demo:banner',
  'Ver catálogo', '/catalogo', true, 1
where not exists (
  select 1 from ns_banners where tenant_id = (select id from ds_tenants where slug = 'demo')
);

-- ---------- settings ----------

insert into ns_settings (
  tenant_id, brand_name, slogan, brand_description, whatsapp_number, whatsapp_display,
  contact_email, contact_address, contact_maps_url, currency, instagram, facebook, tiktok,
  hero_eyebrow, hero_title_line1, hero_title_line2, hero_subtitle, hero_tagline,
  hero_cta_label, hero_cta_href, hero_image, hero_image_position_x, hero_image_position_y,
  brand_logo, payment_badge_icon, payment_badge_label,
  story_eyebrow, story_title, story_description,
  story_step_image1, story_step_image2, story_step_image3, story_step_image4, story_step_image5,
  statement_title_line1, statement_title_line2, statement_description, statement_image
)
values (
  (select id from ds_tenants where slug = 'demo'),
  'Demo Store', 'Tienda de demostración',
  'Catálogo de ejemplo usado para probar el motor multi-tenant de DS Catalog.',
  '10000000000', '+1 000 000 0000',
  'demo@ds-catalog.example', '', '',
  'USD', '', '', '',
  'Catálogo de ejemplo', 'Demo', 'Store', 'Tienda de prueba', 'Datos de ejemplo',
  'Ver catálogo', '/catalogo', 'placeholder:demo:hero', 50, 50,
  '', '', '',
  'Cómo funciona', 'Del panel a tu catálogo',
  'Este texto se administra desde /demo/admin/inicio, igual que en cualquier otro tenant.',
  'placeholder:demo:story-1', 'placeholder:demo:story-2', 'placeholder:demo:story-3',
  'placeholder:demo:story-4', 'placeholder:demo:story-5',
  'Demo is', 'just a test',
  'Sección editable desde el panel — contenido de ejemplo, no real.',
  'placeholder:demo:statement'
)
on conflict (tenant_id) do update set
  brand_name = excluded.brand_name,
  slogan = excluded.slogan,
  brand_description = excluded.brand_description,
  whatsapp_number = excluded.whatsapp_number,
  whatsapp_display = excluded.whatsapp_display,
  contact_email = excluded.contact_email,
  contact_address = excluded.contact_address,
  contact_maps_url = excluded.contact_maps_url,
  currency = excluded.currency,
  instagram = excluded.instagram,
  facebook = excluded.facebook,
  tiktok = excluded.tiktok,
  hero_eyebrow = excluded.hero_eyebrow,
  hero_title_line1 = excluded.hero_title_line1,
  hero_title_line2 = excluded.hero_title_line2,
  hero_subtitle = excluded.hero_subtitle,
  hero_tagline = excluded.hero_tagline,
  hero_cta_label = excluded.hero_cta_label,
  hero_cta_href = excluded.hero_cta_href,
  hero_image = excluded.hero_image,
  hero_image_position_x = excluded.hero_image_position_x,
  hero_image_position_y = excluded.hero_image_position_y,
  brand_logo = excluded.brand_logo,
  payment_badge_icon = excluded.payment_badge_icon,
  payment_badge_label = excluded.payment_badge_label,
  story_eyebrow = excluded.story_eyebrow,
  story_title = excluded.story_title,
  story_description = excluded.story_description,
  story_step_image1 = excluded.story_step_image1,
  story_step_image2 = excluded.story_step_image2,
  story_step_image3 = excluded.story_step_image3,
  story_step_image4 = excluded.story_step_image4,
  story_step_image5 = excluded.story_step_image5,
  statement_title_line1 = excluded.statement_title_line1,
  statement_title_line2 = excluded.statement_title_line2,
  statement_description = excluded.statement_description,
  statement_image = excluded.statement_image;

-- ---------- verification ----------

do $$
declare
  demo_tenant_id uuid;
  categories_count int;
  products_count int;
  banners_count int;
begin
  select id into demo_tenant_id from ds_tenants where slug = 'demo';
  if demo_tenant_id is null then
    raise exception 'Demo seed aborted: tenant "demo" was not created';
  end if;

  select count(*) into categories_count from ns_categories where tenant_id = demo_tenant_id;
  select count(*) into products_count from ns_products where tenant_id = demo_tenant_id;
  select count(*) into banners_count from ns_banners where tenant_id = demo_tenant_id;

  if categories_count <> 2 then
    raise exception 'Demo seed aborted: expected 2 categories, found %', categories_count;
  end if;
  if products_count <> 3 then
    raise exception 'Demo seed aborted: expected 3 products, found %', products_count;
  end if;
  if banners_count < 1 then
    raise exception 'Demo seed aborted: expected at least 1 banner, found %', banners_count;
  end if;

  raise notice 'Demo tenant seeded OK — % categories, % products, % banner(s).', categories_count, products_count, banners_count;
end $$;

commit;
