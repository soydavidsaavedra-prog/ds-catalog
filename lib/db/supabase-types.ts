import type { Audience, Availability, ProductColor } from "@/lib/types/catalog";
import type { OrderItem, OrderStatus } from "@/lib/types/order";
import type { TenantStatus } from "@/lib/types/tenant";

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

export interface SuperAdminUserRow {
  id: string;
  email: string;
  password_hash: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantRow {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  admin_password_hash: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  tenant_id: string;
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
  tenant_id: string;
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
  hide_payment_badge: boolean;
  created_at: string;
  updated_at: string;
}

export interface BannerRow {
  id: string;
  tenant_id: string;
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
  tenant_id: string;
  created_at: string;
  items: OrderItem[];
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: OrderStatus;
}

export interface SettingsRow {
  id: number;
  tenant_id: string;
  brand_name: string;
  slogan: string;
  brand_description: string;
  whatsapp_number: string;
  whatsapp_display: string;
  contact_email: string;
  contact_address: string;
  contact_maps_url: string;
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
  brand_logo: string;
  payment_badge_icon: string;
  payment_badge_label: string;
  story_eyebrow: string;
  story_title: string;
  story_description: string;
  story_step_image1: string;
  story_step_image2: string;
  story_step_image3: string;
  story_step_image4: string;
  story_step_image5: string;
  statement_title_line1: string;
  statement_title_line2: string;
  statement_description: string;
  statement_image: string;
  /** Null = use the platform default (see app/globals.css). Set only for tenants that need to diverge from it. */
  accent_color: string | null;
  accent_color_strong: string | null;
  accent_foreground: string | null;
  /** Null = use NSFactoryStory's built-in default label for that step. */
  story_step_label1: string | null;
  story_step_label2: string | null;
  story_step_label3: string | null;
  story_step_label4: string | null;
  story_step_label5: string | null;
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
      super_admin_users: TableDef<SuperAdminUserRow>;
      ds_tenants: TableDef<TenantRow>;
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
