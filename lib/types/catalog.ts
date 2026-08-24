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
  whatsappNumber: string;
  currency: string;
  instagram: string;
  facebook: string;
  tiktok: string;
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
