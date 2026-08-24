import type { Audience, Availability, ProductColor } from "@/lib/types/catalog";
import type { OrderItem, OrderStatus } from "@/lib/types/order";

/**
 * Minimal hand-written Database type (row shapes only — see
 * supabase/schema.sql for the source of truth). This isn't generated via
 * the Supabase CLI; it exists purely so @supabase/supabase-js's generic
 * client resolves real row types instead of falling back to `never` for
 * insert/update payloads. Insert/Update are intentionally permissive
 * (Partial<Row>) since each repository already builds exact, validated
 * payloads — the point here is unblocking TypeScript, not re-deriving
 * Postgres column defaults/constraints.
 */

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
  featured: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  reference: string;
  name: string;
  price: number;
  wholesale_price: number | null;
  description: string;
  category_slug: string;
  audience: Audience;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  availability: Availability;
  featured: boolean;
  is_new: boolean;
  on_sale: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BannerRow {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta_label: string;
  cta_href: string;
  active: boolean;
  order: number;
}

export interface OrderRow {
  id: string;
  created_at: string;
  items: OrderItem[];
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: OrderStatus;
}

export interface SettingsRow {
  id: number;
  brand_name: string;
  slogan: string;
  whatsapp_number: string;
  currency: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  hero_eyebrow: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtitle: string;
  hero_tagline: string;
  hero_cta_label: string;
  hero_cta_href: string;
  hero_image: string;
  hero_image_position_x: number;
  hero_image_position_y: number;
}

// Each Row/Insert/Update is intersected with Record<string, unknown> so the
// resulting table type structurally satisfies postgrest-js's GenericTable
// (needed for correctly-typed insert/update/select instead of `never`),
// without touching the outer Tables object shape — intersecting *that*
// instead breaks .select("*")'s return type.
type IndexableRow<T> = T & Record<string, unknown>;
type TableDef<Row> = {
  Row: IndexableRow<Row>;
  Insert: Partial<IndexableRow<Row>>;
  Update: Partial<IndexableRow<Row>>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      ns_categories: TableDef<CategoryRow>;
      ns_products: TableDef<ProductRow>;
      ns_banners: TableDef<BannerRow>;
      ns_orders: TableDef<OrderRow>;
      ns_settings: TableDef<SettingsRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
