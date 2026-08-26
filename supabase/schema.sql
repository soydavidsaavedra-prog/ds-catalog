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
--   - ns_categories.parent_id's foreign key becomes a composite FK
--     (tenant_id, parent_id) -> ns_categories(tenant_id, id), so a
--     category can never reference another tenant's category as its
--     parent (requires a new unique (tenant_id, id) constraint too,
--     since Postgres needs a unique index over exactly the referenced
--     column pair).
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

-- Same idea as above but for a single-column foreign key: looks up the
-- real constraint name via pg_constraint instead of assuming Postgres's
-- "<table>_<column>_fkey" naming convention, so replacing a FK with its
-- tenant-aware composite version never depends on a name guess.
create or replace function ds_drop_single_column_fk(tbl text, col text, reftbl text)
returns void as $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_class frel on frel.oid = con.confrelid
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
  where rel.relname = tbl
    and frel.relname = reftbl
    and con.contype = 'f'
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

-- ns_products.category_slug's old FK depends on the unique index behind
-- ns_categories.slug — Postgres refuses to drop that index/constraint
-- while anything still references it. So this drop has to happen here,
-- before the "drop old slug unique" line below, even though the new
-- composite FK it's replaced by is only (re)added later, down in the
-- ns_products section, once ns_categories has its new (tenant_id, slug)
-- unique constraint in place.
select ds_drop_single_column_fk('ns_products', 'category_slug', 'ns_categories');

select ds_drop_single_column_unique('ns_categories', 'slug');
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ns_categories_tenant_id_slug_key'
  ) then
    alter table ns_categories add constraint ns_categories_tenant_id_slug_key unique (tenant_id, slug);
  end if;
end $$;

-- Postgres requires a unique constraint on exactly (tenant_id, id) before
-- anything can hold a composite foreign key referencing that pair — id
-- alone is already unique (uuid primary key), so this adds no new
-- restriction on existing data, it just names the pair explicitly.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ns_categories_tenant_id_id_key'
  ) then
    alter table ns_categories add constraint ns_categories_tenant_id_id_key unique (tenant_id, id);
  end if;
end $$;

-- Closes a multi-tenant gap: the original parent_id FK only checked
-- parent_id -> ns_categories.id, so nothing stopped a category from
-- pointing at a parent belonging to a different tenant. This composite
-- FK ties parent_id to a row that must share the same tenant_id.
-- Top-level categories (parent_id is null) are unaffected — Postgres
-- skips a MATCH SIMPLE foreign key check whenever any of its columns is
-- null, so a null parent_id never needs a matching tenant_id.
select ds_drop_single_column_fk('ns_categories', 'parent_id', 'ns_categories');
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ns_categories_tenant_parent_fkey'
  ) then
    alter table ns_categories
      add constraint ns_categories_tenant_parent_fkey
      foreign key (tenant_id, parent_id) references ns_categories (tenant_id, id) on delete set null;
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

-- The old FK (category_slug -> ns_categories.slug) was already dropped
-- earlier, in the ns_categories section above — it had to go before that
-- section could drop the plain slug unique constraint it depended on.
-- What's left here is just adding the new composite FK, now that
-- ns_categories has its (tenant_id, slug) unique constraint to reference.
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
drop function if exists ds_drop_single_column_fk(text, text, text);

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
  ns_categories_cross_tenant_parent int;
begin
  select count(*) into ns_categories_missing from ns_categories where tenant_id is null;
  select count(*) into ns_products_missing from ns_products where tenant_id is null;
  select count(*) into ns_banners_missing from ns_banners where tenant_id is null;
  select count(*) into ns_orders_missing from ns_orders where tenant_id is null;
  select count(*) into ns_settings_missing from ns_settings where tenant_id is null;
  select count(*) into ns_settings_count from ns_settings;
  select count(*) into ds_tenants_count from ds_tenants where slug = 'elnuevosanchez';
  select count(*) into ns_categories_cross_tenant_parent
    from ns_categories child
    join ns_categories parent on parent.id = child.parent_id
    where child.parent_id is not null and child.tenant_id <> parent.tenant_id;

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
  if ns_categories_cross_tenant_parent > 0 then
    raise exception 'DS Catalog migration aborted: % ns_categories row(s) have a parent_id belonging to a different tenant', ns_categories_cross_tenant_parent;
  end if;

  raise notice 'DS Catalog migration OK — every existing row is tenant-scoped, no cross-tenant category parents, elnuevosanchez tenant present.';
end $$;

commit;

-- =====================================================================
-- DS Catalog — self-service registration & onboarding
-- =====================================================================
-- Adds the bookkeeping a new tenant needs once it can be created by
-- self-service registration (see app/registro) instead of only by hand:
--   - onboarding_completed marks whether the wizard at
--     /[tenant]/admin/onboarding has been finished. Tenants created before
--     this column existed (elnuevosanchez, demo) default to true so they
--     are never sent through onboarding retroactively.
--   - admin_password_hash (already present, added as an unused extension
--     point during the multi-tenant migration) is now actually written to
--     by app/registro's registration action — see lib/auth/tenant-
--     credentials.ts for the hashing scheme. Existing tenants keep this
--     column null and keep authenticating against the shared
--     ADMIN_PASSWORD env var (see lib/auth/admin-auth.ts) until someone
--     sets a real per-tenant password for them.
--
-- Safe to re-run: add-column-if-not-exists + a backfill that only ever
-- touches rows still at the default.

begin;

alter table ds_tenants add column if not exists onboarding_completed boolean not null default false;

update ds_tenants set onboarding_completed = true
where slug in ('elnuevosanchez', 'demo') and onboarding_completed = false;

commit;

-- =====================================================================
-- DS Catalog — per-tenant accent color override
-- =====================================================================
-- app/globals.css's --accent/--accent-strong/--focus-ring are the
-- platform default (teal, matching the DS Catalog mark) — every tenant
-- gets it unless these three columns are set, in which case
-- app/[tenant]/(storefront)/layout.tsx and app/[tenant]/admin/layout.tsx
-- inject a scoped CSS override (see lib/utils/brand.ts,
-- buildAccentOverrideCss). NULL (the default for every tenant, including
-- "demo" and any self-registered via /registro) means "use the platform
-- default" — nothing to backfill for them.
--
-- El Nuevo Sánchez is the one exception: its storefront/admin were built
-- and already deployed around the platform's *original* default (gold),
-- back when there was only one tenant and no notion of a platform color
-- distinct from any one tenant's brand. Pinning its old default here as
-- an explicit per-tenant override keeps its look byte-for-byte the same
-- now that the platform default has moved to teal.
--
-- Safe to re-run: add-column-if-not-exists + a backfill guarded by
-- "still null".

begin;

alter table ns_settings add column if not exists accent_color text;
alter table ns_settings add column if not exists accent_color_strong text;
alter table ns_settings add column if not exists accent_foreground text;

update ns_settings ns
set accent_color = '#f8c909', accent_color_strong = '#e0b400', accent_foreground = '#0a0a09'
from ds_tenants t
where ns.tenant_id = t.id and t.slug = 'elnuevosanchez' and ns.accent_color is null;

commit;

-- =====================================================================
-- DS Catalog — editable "Nuestra fábrica" step labels
-- =====================================================================
-- The 5 labels under the home "De la fábrica a tus manos" step photos
-- (Tela/Corte/Confección/Detalle/Producto) were hardcoded in both
-- components/home/NSFactoryStory.tsx and components/admin/
-- NSStoryEditorForm.tsx — fine for a jeans catalog, wrong for any tenant
-- selling something else. NULL keeps rendering that same original wording
-- (see NSFactoryStory's defaults) until an admin edits it from
-- /admin/inicio, so no backfill is needed for existing tenants.
--
-- Safe to re-run: add-column-if-not-exists only.

begin;

alter table ns_settings add column if not exists story_step_label1 text;
alter table ns_settings add column if not exists story_step_label2 text;
alter table ns_settings add column if not exists story_step_label3 text;
alter table ns_settings add column if not exists story_step_label4 text;
alter table ns_settings add column if not exists story_step_label5 text;

commit;

-- =====================================================================
-- DS Catalog — Super Admin accounts
-- =====================================================================
-- Real per-person accounts for the platform-level Super Admin role —
-- deliberately NOT the same mechanism as tenant admin (one shared
-- ADMIN_PASSWORD, or a tenant's own admin_password_hash). No self-
-- registration: rows here are only ever created by hand, via
-- `npm run superadmin:create` (scripts/create-superadmin.ts), never from
-- a web form — this table is never exposed to public traffic.
--
-- RLS stays enabled with no policies, same as every other table: only
-- the server (service_role) ever queries this, via
-- lib/repositories/superadmin-repository.ts.
--
-- Safe to re-run: create-if-not-exists only, no data changes.

begin;

create table if not exists super_admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists super_admin_users_set_updated_at on super_admin_users;
create trigger super_admin_users_set_updated_at
  before update on super_admin_users
  for each row execute function set_updated_at();

alter table super_admin_users enable row level security;

commit;

-- =====================================================================
-- DS Catalog — tenant lifecycle states (active/paused/suspended/archived)
-- =====================================================================
-- ds_tenants.status was a two-value active/disabled switch (disabled just
-- meant "resolveTenant() 404s it"). The Super Admin needs to distinguish
-- WHY a tenant is unreachable — paused by its own owner, suspended by the
-- platform, or archived (kept for records, never coming back) — without
-- ever deleting the row or its data. Every one of these still 404s at
-- resolveTenant() exactly like "disabled" did (only 'active' resolves),
-- so this changes vocabulary, not behavior, for elnuevosanchez/demo/every
-- existing tenant: none of them were ever 'disabled', so there is nothing
-- to backfill for them, but any future 'disabled' row (there shouldn't be
-- one) maps to 'suspended' rather than being left invalid.
--
-- Safe to re-run: drop-and-recreate the same check constraint, backfill
-- guarded by the old value.

begin;

update ds_tenants set status = 'suspended' where status = 'disabled';

do $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'ds_tenants' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%status%';
  if conname is not null then
    execute format('alter table ds_tenants drop constraint %I', conname);
  end if;
end $$;

alter table ds_tenants add constraint ds_tenants_status_check
  check (status in ('active', 'paused', 'suspended', 'archived'));

commit;

-- =====================================================================
-- DS Catalog — plans & subscriptions (structural, no billing yet)
-- =====================================================================
-- Deliberately the opposite of Horizon's plan model (see
-- docs/ANALISIS_HORIZON_REFERENCIA_SAAS.md section 5): there, "plan" was
-- a free-text UI label ("Básico ($5/mes)") stored straight on the
-- subscription, while a SEPARATE, disconnected capabilities module keyed
-- off lowercase slugs ("basico") that never matched — the mismatch meant
-- plan-based limits silently never applied. Here, plans.key is the single
-- normalized identifier both the UI and any future limit-enforcement code
-- reads, and subscriptions.plan_id is a real foreign key — there is no
-- second place a plan's identity could drift out of sync.
--
-- No tenant is auto-subscribed here: existing tenants (elnuevosanchez,
-- demo, and anything self-registered so far) keep working exactly as
-- before — active and unlimited — until a Super Admin deliberately
-- assigns a plan from /superadmin. This migration only adds the
-- structure and 3 example plans, per "NO implementar Stripe/cobros
-- todavía" — nothing here changes what any tenant can currently do.
--
-- Safe to re-run: create-if-not-exists + an idempotent plan seed keyed by
-- `key`.

begin;

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text not null default '',
  price_cents integer not null default 0,
  max_products integer,
  max_storage_mb integer,
  max_images integer,
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists plans_set_updated_at on plans;
create trigger plans_set_updated_at
  before update on plans
  for each row execute function set_updated_at();

alter table plans enable row level security;

insert into plans (key, name, description, price_cents, max_products, max_storage_mb, max_images, features)
values
  ('basic', 'Basic', 'Para empezar a vender por WhatsApp.', 900, 50, 250, 200, '["Catálogo público", "Pedidos por WhatsApp", "1 tema"]'::jsonb),
  ('pro', 'Pro', 'Para catálogos en crecimiento.', 2900, 300, 1024, 1000, '["Todo lo de Basic", "Productos ilimitados de temporada", "Banners personalizados"]'::jsonb),
  ('premium', 'Premium', 'Sin límites de catálogo.', 5900, null, 5120, null, '["Todo lo de Pro", "Storage ampliado", "Soporte prioritario"]'::jsonb)
on conflict (key) do nothing;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references ds_tenants (id),
  plan_id uuid not null references plans (id),
  status text not null default 'trial' check (status in ('active', 'trial', 'paused', 'expired', 'cancelled')),
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists subscriptions_set_updated_at on subscriptions;
create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

alter table subscriptions enable row level security;

commit;

-- =====================================================================
-- DS Catalog — database size RPC
-- =====================================================================
-- pg_database_size() isn't reachable through PostgREST's normal
-- table/view surface (there's no "database" table to select from) — a
-- function is the only way to expose it as an RPC. Real, live number,
-- read fresh on every /superadmin/storage request — nothing cached or
-- guessed here. Storage usage (object sizes) is computed separately, in
-- lib/repositories/storage-repository.ts, via the Storage API rather
-- than a raw query against the `storage` schema (which usually isn't
-- exposed through PostgREST on a stock Supabase project). Network egress
-- has no equivalent — it isn't queryable from inside Postgres at all —
-- so it stays unimplemented rather than faked; a real number needs the
-- Supabase Management API with its own access token, out of scope here.
--
-- Safe to re-run: create-or-replace only.

begin;

create or replace function get_database_size_bytes()
returns bigint
language sql
stable
as $$
  select pg_database_size(current_database());
$$;

commit;

-- =====================================================================
-- DS Catalog — tenant business type
-- =====================================================================
-- What kind of business a tenant runs — chosen at registration (or set by
-- a Super Admin) — drives which optional product attributes their admin
-- panel shows (see lib/tenant/business-type.ts): a "ferreteria" tenant's
-- product form has no reason to show Tallas/Colores, a "moda" tenant's
-- does. Every tenant that existed before this concept did (El Nuevo
-- Sánchez, demo) backfills to 'moda' — the one profile with sizes/colors
-- fully enabled, i.e. exactly their current behavior. Nothing about how
-- they work changes.
--
-- Safe to re-run: add-column-if-not-exists + backfill guarded by null +
-- drop-and-recreate the same check constraint.

begin;

alter table ds_tenants add column if not exists business_type text;

update ds_tenants set business_type = 'moda' where business_type is null;

alter table ds_tenants alter column business_type set not null;
alter table ds_tenants alter column business_type set default 'moda';

do $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'ds_tenants' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%business_type%';
  if conname is not null then
    execute format('alter table ds_tenants drop constraint %I', conname);
  end if;
end $$;

alter table ds_tenants add constraint ds_tenants_business_type_check
  check (business_type in ('moda', 'ferreteria', 'restaurante', 'belleza', 'tecnologia', 'hogar', 'otro'));

commit;

-- =====================================================================
-- DS Catalog — per-product card shape + image fit
-- =====================================================================
-- Product photos aren't all the same shape — some near-square, some
-- wider, some taller — and the catalog card/gallery used to force every
-- one of them into a fixed 4:5 crop (object-fit: cover), silently
-- cropping out whatever didn't fit. Both are now per-product: the card's
-- frame shape (card_aspect_ratio) and whether the image fills that frame
-- by cropping (cover, the old-and-only behavior) or is shown in full with
-- neutral letterboxing (contain). Defaults ('portrait' + 'cover') are
-- exactly the old hardcoded behavior, so every existing product (El Nuevo
-- Sánchez, demo, anything else already created) renders pixel-identical
-- to before — this is purely a new option, never a retroactive change.
--
-- Safe to re-run: add-column-if-not-exists with the default already
-- applied (Postgres backfills a NOT NULL + DEFAULT column addition in the
-- same statement — no separate UPDATE needed) + drop-and-recreate the
-- same check constraints.

begin;

alter table ns_products add column if not exists card_aspect_ratio text not null default 'portrait';
alter table ns_products add column if not exists image_fit text not null default 'cover';

do $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'ns_products' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%card_aspect_ratio%';
  if conname is not null then
    execute format('alter table ns_products drop constraint %I', conname);
  end if;

  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'ns_products' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%image_fit%';
  if conname is not null then
    execute format('alter table ns_products drop constraint %I', conname);
  end if;
end $$;

alter table ns_products add constraint ns_products_card_aspect_ratio_check
  check (card_aspect_ratio in ('portrait', 'square', 'landscape'));
alter table ns_products add constraint ns_products_image_fit_check
  check (image_fit in ('cover', 'contain'));

commit;

-- Identidad real por email (Supabase Auth) en vez de contraseña compartida
-- por slug/superadmin. ds_app_users.id es siempre el mismo id que
-- auth.users.id de Supabase Auth — esta tabla es solo el "perfil" (rol +
-- a qué tenant pertenece), la contraseña en sí vive en Supabase Auth, no
-- aquí. Un owner tiene tenant_id (relación 1:1 con ds_tenants, igual que
-- Horizon — ver docs/ANALISIS_HORIZON_REFERENCIA_SAAS.md sección 4); un
-- superadmin tiene tenant_id null. on delete cascade en tenant_id: al
-- borrar un tenant (deleteTenant en tenant-repository.ts) su fila de
-- ds_app_users desaparece sola — el hard-delete además borra el usuario
-- de Supabase Auth explícitamente (ver deleteTenantAction) para no dejar
-- una cuenta huérfana sin tenant ni perfil.
--
-- Ninguna política RLS activa aquí tampoco: esta tabla solo se lee/escribe
-- desde repositorios de servidor con el cliente service_role, igual que
-- el resto del esquema (ver docs/ARCHITECTURE.md). Sin RLS.

begin;

create table if not exists ds_app_users (
  id uuid primary key,
  email text not null unique,
  role text not null check (role in ('owner', 'superadmin')),
  tenant_id uuid references ds_tenants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ds_app_users_tenant_id_idx on ds_app_users(tenant_id);

commit;

-- Nuevo estado 'pending': un tenant recién autoregistrado (/registro) elige
-- un plan en el onboarding y queda con una suscripción 'pending' — ni
-- "activo e ilimitado" (el comportamiento de "sin suscripción" que
-- conservan los tenants creados antes de este cambio) ni con acceso real,
-- hasta que un Super Admin la revisa y la pasa a 'active' desde la ficha
-- del cliente. Ver lib/tenant/plan-limits.ts (getFreezeReason) y
-- app/[tenant]/admin/actions.ts (completeOnboardingAction).

begin;

do $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'subscriptions' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%status%';
  if conname is not null then
    execute format('alter table subscriptions drop constraint %I', conname);
  end if;
end $$;

alter table subscriptions add constraint subscriptions_status_check
  check (status in ('pending', 'active', 'trial', 'paused', 'expired', 'cancelled'));

commit;

-- Panel "Mi cuenta" del tenant: pedir un cambio de plan o pedir eliminar
-- la cuenta son SOLICITUDES, no acciones inmediatas — ninguna de las dos
-- cambia nada por sí sola. requested_plan_id no toca subscriptions.plan_id
-- ni .status (el tenant sigue con acceso normal a su plan actual mientras
-- espera), y deletion_requested_at es solo una marca de tiempo que Super
-- Admin ve y decide: procede con el hard-delete ya existente
-- (deleteTenantAction) o descarta la solicitud. Ver app/[tenant]/admin/
-- actions.ts y app/superadmin/actions.ts.

begin;

alter table subscriptions add column if not exists requested_plan_id uuid references plans(id);
alter table ds_tenants add column if not exists deletion_requested_at timestamptz;

commit;
