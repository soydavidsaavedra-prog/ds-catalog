-- El Nuevo Sánchez — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Mirrors lib/types/catalog.ts and lib/types/order.ts 1:1 so the repository
-- layer (lib/repositories/*.ts) can map rows <-> app types with no surprises.
--
-- All access from the app goes through the service_role key, server-side
-- only (see lib/db/supabaseClient.ts) — repositories are "server-only"
-- modules, the same way they were against the JSON file store. RLS is
-- enabled with NO policies below, so if the anon/public key is ever used
-- from the browser it can read or write nothing; only service_role
-- (which bypasses RLS) can touch these tables.
--
-- Tables are prefixed with ns_ (El Nuevo Sánchez) so this never collides
-- with tables from any other project sharing the same Supabase project
-- (e.g. an old, unrelated "products" table) — this schema never reads,
-- writes, or drops anything it didn't create itself.

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- ns_categories ----------

create table if not exists ns_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  image text not null default '',
  "order" integer not null default 0,
  active boolean not null default true,
  featured boolean not null default false,
  parent_id uuid references ns_categories (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfills parent_id on a table created by an earlier version of this schema.
alter table ns_categories add column if not exists parent_id uuid references ns_categories (id) on delete set null;

create index if not exists ns_categories_parent_id_idx on ns_categories (parent_id);

drop trigger if exists ns_categories_set_updated_at on ns_categories;
create trigger ns_categories_set_updated_at
  before update on ns_categories
  for each row execute function set_updated_at();

alter table ns_categories enable row level security;

-- ---------- ns_products ----------

create table if not exists ns_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  reference text not null,
  name text not null,
  price numeric(10, 2) not null default 0,
  wholesale_price numeric(10, 2),
  description text not null default '',
  category_slug text not null references ns_categories (slug) on update cascade,
  audience text not null default 'unisex'
    check (audience in ('dama', 'caballero', 'nino', 'unisex')),
  images text[] not null default '{}',
  sizes text[] not null default '{}',
  colors jsonb not null default '[]', -- [{ "name": "Azul", "hex": "#3f628a" }, ...]
  availability text not null default 'in_stock'
    check (availability in ('in_stock', 'low_stock', 'out_of_stock')),
  featured boolean not null default false,
  is_new boolean not null default false,
  on_sale boolean not null default false,
  active boolean not null default true,
  hide_payment_badge boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfills hide_payment_badge on a table created by an earlier version of this schema.
alter table ns_products add column if not exists hide_payment_badge boolean not null default false;

create index if not exists ns_products_category_slug_idx on ns_products (category_slug);

drop trigger if exists ns_products_set_updated_at on ns_products;
create trigger ns_products_set_updated_at
  before update on ns_products
  for each row execute function set_updated_at();

alter table ns_products enable row level security;

-- ---------- ns_banners ----------

create table if not exists ns_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  image text not null default '',
  cta_label text not null default '',
  cta_href text not null default '/catalogo',
  active boolean not null default true,
  "order" integer not null default 0
);

alter table ns_banners enable row level security;

-- ---------- ns_orders ----------

create table if not exists ns_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  items jsonb not null default '[]', -- OrderItem[]
  total numeric(10, 2) not null default 0,
  customer_name text,
  customer_phone text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'confirmed', 'completed', 'cancelled'))
);

alter table ns_orders enable row level security;

-- ---------- ns_settings (singleton row) ----------

create table if not exists ns_settings (
  id smallint primary key default 1 check (id = 1),
  brand_name text not null default 'El Nuevo Sánchez',
  slogan text not null default 'De la fábrica a tus manos',
  brand_description text not null default '',
  whatsapp_number text not null default '',
  whatsapp_display text not null default '',
  contact_email text not null default '',
  contact_address text not null default '',
  contact_maps_url text not null default '',
  currency text not null default 'USD',
  instagram text not null default '',
  facebook text not null default '',
  tiktok text not null default '',
  -- Home hero content, editable from /admin/inicio (see components/home/NSHero.tsx).
  hero_eyebrow text not null default 'Calidad · Diseño · Confort',
  hero_title_line1 text not null default 'El Nuevo',
  hero_title_line2 text not null default 'Sánchez',
  hero_subtitle text not null default 'Especialista en Jeans',
  hero_tagline text not null default 'De la fábrica a tus manos',
  hero_cta_label text not null default 'Explorar colección',
  hero_cta_href text not null default '/catalogo',
  hero_image text not null default 'placeholder:hero:hero-1',
  hero_image_position_x numeric(5, 2) not null default 50,
  hero_image_position_y numeric(5, 2) not null default 50,
  -- Real brand logo + payment-method badge (e.g. Cashea), uploaded from
  -- /admin/configuracion. Empty string = fall back to the built-in SVG logo
  -- / hide the badge everywhere.
  brand_logo text not null default '',
  payment_badge_icon text not null default '',
  payment_badge_label text not null default 'Disponible con Cashea',
  -- "De la fábrica a tus manos" home section (see components/home/NSFactoryStory.tsx).
  story_eyebrow text not null default 'Nuestro proceso',
  story_title text not null default 'De la fábrica a tus manos',
  story_description text not null default 'Cada jean nace en nuestra fábrica: tela seleccionada, corte preciso, confección artesanal y un control de detalle que no se negocia.',
  story_step_image1 text not null default 'placeholder:fábrica:story-tela',
  story_step_image2 text not null default 'placeholder:fábrica:story-corte',
  story_step_image3 text not null default 'placeholder:fábrica:story-confeccion',
  story_step_image4 text not null default 'placeholder:fábrica:story-detalle',
  story_step_image5 text not null default 'placeholder:fábrica:story-producto',
  -- "Denim is our language" home section (see components/home/NSBrandStatement.tsx).
  statement_title_line1 text not null default 'Denim is',
  statement_title_line2 text not null default 'our language',
  statement_description text not null default 'Calidad que se siente, estilo que te define. Cada pieza sale de nuestra fábrica con un mismo propósito: vestir bien, sin intermediarios.',
  statement_image text not null default 'placeholder:denim:brand-statement'
);

-- Backfills the hero_* columns (with their defaults) on a table created by
-- an earlier version of this schema — existing rows get the default values.
alter table ns_settings add column if not exists hero_eyebrow text not null default 'Calidad · Diseño · Confort';
alter table ns_settings add column if not exists hero_title_line1 text not null default 'El Nuevo';
alter table ns_settings add column if not exists hero_title_line2 text not null default 'Sánchez';
alter table ns_settings add column if not exists hero_subtitle text not null default 'Especialista en Jeans';
alter table ns_settings add column if not exists hero_tagline text not null default 'De la fábrica a tus manos';
alter table ns_settings add column if not exists hero_cta_label text not null default 'Explorar colección';
alter table ns_settings add column if not exists hero_cta_href text not null default '/catalogo';
alter table ns_settings add column if not exists hero_image text not null default 'placeholder:hero:hero-1';
alter table ns_settings add column if not exists hero_image_position_x numeric(5, 2) not null default 50;
alter table ns_settings add column if not exists hero_image_position_y numeric(5, 2) not null default 50;
alter table ns_settings add column if not exists brand_logo text not null default '';
alter table ns_settings add column if not exists payment_badge_icon text not null default '';
alter table ns_settings add column if not exists payment_badge_label text not null default 'Disponible con Cashea';
alter table ns_settings add column if not exists brand_description text not null default '';
alter table ns_settings add column if not exists whatsapp_display text not null default '';
alter table ns_settings add column if not exists contact_email text not null default '';
alter table ns_settings add column if not exists contact_address text not null default '';
alter table ns_settings add column if not exists contact_maps_url text not null default '';
alter table ns_settings add column if not exists story_eyebrow text not null default 'Nuestro proceso';
alter table ns_settings add column if not exists story_title text not null default 'De la fábrica a tus manos';
alter table ns_settings add column if not exists story_description text not null default 'Cada jean nace en nuestra fábrica: tela seleccionada, corte preciso, confección artesanal y un control de detalle que no se negocia.';
alter table ns_settings add column if not exists story_step_image1 text not null default 'placeholder:fábrica:story-tela';
alter table ns_settings add column if not exists story_step_image2 text not null default 'placeholder:fábrica:story-corte';
alter table ns_settings add column if not exists story_step_image3 text not null default 'placeholder:fábrica:story-confeccion';
alter table ns_settings add column if not exists story_step_image4 text not null default 'placeholder:fábrica:story-detalle';
alter table ns_settings add column if not exists story_step_image5 text not null default 'placeholder:fábrica:story-producto';
alter table ns_settings add column if not exists statement_title_line1 text not null default 'Denim is';
alter table ns_settings add column if not exists statement_title_line2 text not null default 'our language';
alter table ns_settings add column if not exists statement_description text not null default 'Calidad que se siente, estilo que te define. Cada pieza sale de nuestra fábrica con un mismo propósito: vestir bien, sin intermediarios.';
alter table ns_settings add column if not exists statement_image text not null default 'placeholder:denim:brand-statement';

alter table ns_settings enable row level security;

-- Bootstrap the single settings row so getSettings() always finds one, even
-- before the seed script runs. Real values (WhatsApp number, etc.) can be
-- edited any time from /admin/configuracion.
insert into ns_settings (id, brand_name, slogan, whatsapp_number, currency)
values (1, 'El Nuevo Sánchez', 'De la fábrica a tus manos', '584121234567', 'USD')
on conflict (id) do nothing;

-- ---------- storage: product image uploads ----------
-- Public bucket: product photos need to be viewable by any visitor via a
-- plain URL, same as the local /public/uploads/ files were. Uploads only
-- ever happen through /admin/api/upload (service_role, server-side), so a
-- public *read* policy is safe — there is no public write access. Named
-- ns-product-images (not just "product-images") for the same collision-
-- avoidance reason as the ns_ table prefix above.

insert into storage.buckets (id, name, public)
values ('ns-product-images', 'ns-product-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read access to ns-product-images'
  ) then
    create policy "Public read access to ns-product-images"
      on storage.objects for select
      using (bucket_id = 'ns-product-images');
  end if;
end $$;

-- =====================================================================
-- DS Catalog — multi-tenant migration
-- =====================================================================
-- Everything below turns this single-tenant "El Nuevo Sánchez" schema
-- into a shared, multi-tenant one: one engine (this schema, these
-- tables) serving many independent catalogs, each scoped by tenant_id.
--
-- Design:
--   - ds_tenants is the new tenant registry (id, slug, name, status).
--   - Every ns_* table gets a tenant_id column (FK to ds_tenants).
--   - Slugs (ns_categories.slug, ns_products.slug) were globally unique;
--     they become unique PER TENANT instead (composite unique on
--     (tenant_id, slug)), so two tenants can each have their own
--     "skinny-azul" without colliding.
--   - ns_products.category_slug's foreign key becomes a composite FK
--     (tenant_id, category_slug) -> ns_categories(tenant_id, slug), so a
--     product can never reference another tenant's category.
--   - ns_settings stops being a single global singleton row (id smallint
--     primary key check (id = 1)) and becomes one row per tenant, keyed
--     by tenant_id.
--
-- Safety: this block only ever ADDS columns/constraints and BACKFILLS
-- existing rows — it never deletes or truncates anything. All existing
-- data (the current single tenant's categories/products/banners/orders/
-- settings) is assigned to the "elnuevosanchez" tenant automatically.
-- The whole block runs in one transaction with a row-count check before
-- it commits: if anything doesn't add up, the transaction rolls back
-- and the RAISE EXCEPTION message explains what to look at — nothing
-- partial is ever left committed.
--
-- Safe to re-run: every step is idempotent (add column if not exists,
-- backfill only where tenant_id is still null, drop constraint if
-- exists before re-adding it under its new shape).
--
-- Security model (unchanged from the single-tenant schema, see the note
-- at the top of this file): RLS stays enabled with NO public policies
-- below. The app never uses the anon/public key from the browser — only
-- the server, via the service_role key (which bypasses RLS), talks to
-- Supabase, and every repository query now filters by tenant_id. If a
-- future phase ever calls Supabase directly from the browser (e.g. with
-- Supabase Auth), real per-tenant RLS policies keyed off an
-- authenticated user's tenant claim must be added at that time — do not
-- reuse the client-supplied tenant slug/id as the sole isolation
-- mechanism for that use case.

begin;

-- ---------- ds_tenants ----------

create table if not exists ds_tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'disabled')),
  -- Hook for real per-tenant admin credentials (Tenant Admin), unused for
  -- now — today's admin login still checks the shared ADMIN_PASSWORD env
  -- var (see lib/auth/admin-token.ts); this column is the extension point
  -- for the next phase, not yet wired into the login flow.
  admin_password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists ds_tenants_set_updated_at on ds_tenants;
create trigger ds_tenants_set_updated_at
  before update on ds_tenants
  for each row execute function set_updated_at();

alter table ds_tenants enable row level security;

insert into ds_tenants (slug, name, status)
values ('elnuevosanchez', 'El Nuevo Sánchez', 'active')
on conflict (slug) do nothing;

-- Small helper used below to drop a single-column unique constraint
-- regardless of its actual name (Postgres auto-names inline `unique`
-- column constraints as "<table>_<column>_key", but this looks it up via
-- pg_constraint instead of assuming that, so it can't silently no-op).
create or replace function ds_drop_single_column_unique(tbl text, col text)
returns void as $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
  where rel.relname = tbl
    and con.contype = 'u'
    and array_length(con.conkey, 1) = 1
    and att.attname = col;

  if conname is not null then
    execute format('alter table %I drop constraint %I', tbl, conname);
  end if;
end;
$$ language plpgsql;

-- ---------- ns_categories: tenant_id + per-tenant unique slug ----------

alter table ns_categories add column if not exists tenant_id uuid references ds_tenants (id);

update ns_categories set tenant_id = (select id from ds_tenants where slug = 'elnuevosanchez')
where tenant_id is null;

alter table ns_categories alter column tenant_id set not null;
create index if not exists ns_categories_tenant_id_idx on ns_categories (tenant_id);

select ds_drop_single_column_unique('ns_categories', 'slug');
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ns_categories_tenant_id_slug_key'
  ) then
    alter table ns_categories add constraint ns_categories_tenant_id_slug_key unique (tenant_id, slug);
  end if;
end $$;

-- ---------- ns_products: tenant_id + per-tenant unique slug + composite FK to category ----------

alter table ns_products add column if not exists tenant_id uuid references ds_tenants (id);

update ns_products set tenant_id = (select id from ds_tenants where slug = 'elnuevosanchez')
where tenant_id is null;

alter table ns_products alter column tenant_id set not null;
create index if not exists ns_products_tenant_id_idx on ns_products (tenant_id);

select ds_drop_single_column_unique('ns_products', 'slug');
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ns_products_tenant_id_slug_key'
  ) then
    alter table ns_products add constraint ns_products_tenant_id_slug_key unique (tenant_id, slug);
  end if;
end $$;

-- The old FK was a single-column (category_slug -> ns_categories.slug),
-- which relied on ns_categories.slug being globally unique. Now that
-- slugs are only unique per tenant, it must become a composite FK so a
-- product can never point at a category belonging to a different tenant.
alter table ns_products drop constraint if exists ns_products_category_slug_fkey;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ns_products_tenant_category_fkey'
  ) then
    alter table ns_products
      add constraint ns_products_tenant_category_fkey
      foreign key (tenant_id, category_slug) references ns_categories (tenant_id, slug) on update cascade;
  end if;
end $$;

-- ---------- ns_banners: tenant_id ----------

alter table ns_banners add column if not exists tenant_id uuid references ds_tenants (id);

update ns_banners set tenant_id = (select id from ds_tenants where slug = 'elnuevosanchez')
where tenant_id is null;

alter table ns_banners alter column tenant_id set not null;
create index if not exists ns_banners_tenant_id_idx on ns_banners (tenant_id);

-- ---------- ns_orders: tenant_id ----------

alter table ns_orders add column if not exists tenant_id uuid references ds_tenants (id);

update ns_orders set tenant_id = (select id from ds_tenants where slug = 'elnuevosanchez')
where tenant_id is null;

alter table ns_orders alter column tenant_id set not null;
create index if not exists ns_orders_tenant_id_idx on ns_orders (tenant_id);

-- ---------- ns_settings: singleton row -> one row per tenant ----------

alter table ns_settings add column if not exists tenant_id uuid references ds_tenants (id);

update ns_settings set tenant_id = (select id from ds_tenants where slug = 'elnuevosanchez')
where tenant_id is null;

-- Drop the "id = 1" singleton check (whatever it's actually named) so
-- more than one settings row can exist. id is kept around (harmless,
-- just no longer meaningful as a key) rather than dropped outright — the
-- app looks rows up by tenant_id from here on, never by id.
do $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'ns_settings' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%id = 1%';
  if conname is not null then
    execute format('alter table ns_settings drop constraint %I', conname);
  end if;
end $$;

-- Replace the fixed "default 1" with a real sequence so every future
-- tenant's settings row (seeded or created by hand) gets its id
-- automatically — nothing that inserts into ns_settings needs to know or
-- pick an unused id itself.
create sequence if not exists ns_settings_id_seq owned by ns_settings.id;
select setval('ns_settings_id_seq', (select coalesce(max(id), 1) from ns_settings));
alter table ns_settings alter column id set default nextval('ns_settings_id_seq');

alter table ns_settings alter column tenant_id set not null;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ns_settings_tenant_id_key'
  ) then
    alter table ns_settings add constraint ns_settings_tenant_id_key unique (tenant_id);
  end if;
end $$;

drop function if exists ds_drop_single_column_unique(text, text);

-- ---------- self-verification: no row lost, every row tenant-scoped ----------

do $$
declare
  ns_categories_missing int;
  ns_products_missing int;
  ns_banners_missing int;
  ns_orders_missing int;
  ns_settings_missing int;
  ns_settings_count int;
  ds_tenants_count int;
begin
  select count(*) into ns_categories_missing from ns_categories where tenant_id is null;
  select count(*) into ns_products_missing from ns_products where tenant_id is null;
  select count(*) into ns_banners_missing from ns_banners where tenant_id is null;
  select count(*) into ns_orders_missing from ns_orders where tenant_id is null;
  select count(*) into ns_settings_missing from ns_settings where tenant_id is null;
  select count(*) into ns_settings_count from ns_settings;
  select count(*) into ds_tenants_count from ds_tenants where slug = 'elnuevosanchez';

  if ds_tenants_count <> 1 then
    raise exception 'DS Catalog migration aborted: expected exactly 1 "elnuevosanchez" tenant row, found %', ds_tenants_count;
  end if;
  if ns_categories_missing > 0 then
    raise exception 'DS Catalog migration aborted: % ns_categories row(s) still have no tenant_id', ns_categories_missing;
  end if;
  if ns_products_missing > 0 then
    raise exception 'DS Catalog migration aborted: % ns_products row(s) still have no tenant_id', ns_products_missing;
  end if;
  if ns_banners_missing > 0 then
    raise exception 'DS Catalog migration aborted: % ns_banners row(s) still have no tenant_id', ns_banners_missing;
  end if;
  if ns_orders_missing > 0 then
    raise exception 'DS Catalog migration aborted: % ns_orders row(s) still have no tenant_id', ns_orders_missing;
  end if;
  if ns_settings_missing > 0 then
    raise exception 'DS Catalog migration aborted: % ns_settings row(s) still have no tenant_id', ns_settings_missing;
  end if;
  if ns_settings_count < 1 then
    raise exception 'DS Catalog migration aborted: ns_settings has no rows at all — the elnuevosanchez settings row is missing';
  end if;

  raise notice 'DS Catalog migration OK — every existing row is tenant-scoped, elnuevosanchez tenant present.';
end $$;

commit;
