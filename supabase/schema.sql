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

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- categories ----------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  image text not null default '',
  "order" integer not null default 0,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

alter table categories enable row level security;

-- ---------- products ----------

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  reference text not null,
  name text not null,
  price numeric(10, 2) not null default 0,
  wholesale_price numeric(10, 2),
  description text not null default '',
  category_slug text not null references categories (slug) on update cascade,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_slug_idx on products (category_slug);

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

alter table products enable row level security;

-- ---------- banners ----------

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  image text not null default '',
  cta_label text not null default '',
  cta_href text not null default '/catalogo',
  active boolean not null default true,
  "order" integer not null default 0
);

alter table banners enable row level security;

-- ---------- orders ----------

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  items jsonb not null default '[]', -- OrderItem[]
  total numeric(10, 2) not null default 0,
  customer_name text,
  customer_phone text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'confirmed', 'completed', 'cancelled'))
);

alter table orders enable row level security;

-- ---------- settings (singleton row) ----------

create table if not exists settings (
  id smallint primary key default 1 check (id = 1),
  brand_name text not null default 'El Nuevo Sánchez',
  slogan text not null default 'De la fábrica a tus manos',
  whatsapp_number text not null default '',
  currency text not null default 'USD',
  instagram text not null default '',
  facebook text not null default '',
  tiktok text not null default ''
);

alter table settings enable row level security;

-- Bootstrap the single settings row so getSettings() always finds one, even
-- before the seed script runs. Real values (WhatsApp number, etc.) can be
-- edited any time from /admin/configuracion.
insert into settings (id, brand_name, slogan, whatsapp_number, currency)
values (1, 'El Nuevo Sánchez', 'De la fábrica a tus manos', '584121234567', 'USD')
on conflict (id) do nothing;

-- ---------- storage: product image uploads ----------
-- Public bucket: product photos need to be viewable by any visitor via a
-- plain URL, same as the local /public/uploads/ files were. Uploads only
-- ever happen through /admin/api/upload (service_role, server-side), so a
-- public *read* policy is safe — there is no public write access.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read access to product images'
  ) then
    create policy "Public read access to product images"
      on storage.objects for select
      using (bucket_id = 'product-images');
  end if;
end $$;
