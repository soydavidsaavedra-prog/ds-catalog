/**
 * Core catalog entities. These mirror the shape a future Postgres/Supabase
 * schema would use (see docs/ARCHITECTURE.md) so the repository layer can
 * be swapped without touching components.
 */

export type Availability = "in_stock" | "low_stock" | "out_of_stock";

export type ProductBadge = "featured" | "new" | "sale";

/**
 * Audience is a lightweight tag (not a full Category) used to power the
 * three homepage entry tiles (Dama / Caballero / Niños) and an optional
 * catalog filter chip. Garment-type Category remains the primary taxonomy.
 */
export type Audience = "dama" | "caballero" | "nino" | "unisex";

export interface ProductColor {
  name: string;
  /** Swatch color, used to render the color picker dot. */
  hex: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
  featured: boolean;
  /** Null for a top-level category (e.g. Dama); set to a parent's id for a subcategory (e.g. Skinny under Dama). */
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  slug: string;
  reference: string;
  name: string;
  /** Public retail price shown to every visitor. */
  price: number;
  /** Internal wholesale price — never rendered on public pages (see section 21). */
  wholesalePrice: number | null;
  description: string;
  categorySlug: string;
  audience: Audience;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  availability: Availability;
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  active: boolean;
  /** Opt this product out of the site-wide payment-method badge (e.g. Cashea) shown on cards/detail. */
  hidePaymentBadge: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
  order: number;
}

export interface SiteSettings {
  brandName: string;
  slogan: string;
  /** Long-form description shown in the footer. */
  brandDescription: string;
  whatsappNumber: string;
  /** Formatted phone shown as text in the footer (e.g. "+58 412 123 4567"); whatsappNumber (digits only) drives the wa.me link. */
  whatsappDisplay: string;
  contactEmail: string;
  contactAddress: string;
  /** Full Google Maps URL — footer address links here when set. */
  contactMapsUrl: string;
  currency: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  /** Home hero content — editable from /admin/inicio. Falls back to the launch copy when unset. */
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroTagline: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroImage: string;
  /** Percent (0-100) — CSS object-position of the hero background image. */
  heroImagePositionX: number;
  heroImagePositionY: number;
  /** Real brand logo (uploaded via /admin/configuracion). Empty = fall back to the built-in SVG recreation. */
  brandLogo: string;
  /** Payment-method badge shown on product cards (e.g. Cashea). Empty = badge hidden everywhere. */
  paymentBadgeIcon: string;
  paymentBadgeLabel: string;
  /** "De la fábrica a tus manos" home section — editable from /admin/inicio. Step labels (Tela/Corte/...) stay fixed; only copy + photos are editable. */
  storyEyebrow: string;
  storyTitle: string;
  storyDescription: string;
  storyStepImage1: string;
  storyStepImage2: string;
  storyStepImage3: string;
  storyStepImage4: string;
  storyStepImage5: string;
  /** "Denim is our language" home section — editable from /admin/inicio. */
  statementTitleLine1: string;
  statementTitleLine2: string;
  statementDescription: string;
  statementImage: string;
  /**
   * Overrides the platform's default accent color (see app/globals.css)
   * for this tenant. Null on every tenant except El Nuevo Sánchez, which
   * is pinned to its original gold — see supabase/schema.sql's "per-tenant
   * accent color override" section for why.
   */
  accentColor: string | null;
  accentColorStrong: string | null;
  accentForeground: string | null;
  /**
   * Labels for the 5 "De la fábrica a tus manos" step photos — null falls
   * back to NSFactoryStory's default (Tela/Corte/Confección/Detalle/
   * Producto), which only makes sense for a clothing catalog.
   */
  storyStepLabel1: string | null;
  storyStepLabel2: string | null;
  storyStepLabel3: string | null;
  storyStepLabel4: string | null;
  storyStepLabel5: string | null;
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export interface CatalogFilters {
  query?: string;
  category?: string;
  audience?: Audience;
  sizes?: string[];
  colors?: string[];
  availability?: Availability[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}
