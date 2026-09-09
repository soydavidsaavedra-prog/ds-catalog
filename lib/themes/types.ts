import type { ReactNode } from "react";
import type { Category, CatalogFilters, HeroSlide, Product, SiteSettings } from "@/lib/types/catalog";
import type { ThemeKey } from "@/lib/types/tenant";

/**
 * The contract every storefront Theme must implement. Each entry is a
 * page-level composition — not a fixed slot machine of interchangeable
 * sub-components — because different Themes legitimately want a different
 * set/order of home sections (see components/storefront/themes/theme-01's
 * Home vs. theme-02's). A Theme owns PRESENTATION + LAYOUT +
 * COMPOSITION; it always receives the same real tenant data (settings,
 * categories, products) — never a data shape of its own.
 *
 * Header/Footer/CartDrawer stay component-level (not page-level) because
 * every route wraps the same header/footer/cart drawer via
 * app/[tenant]/(storefront)/layout.tsx.
 */
export interface ThemeHeaderProps {
  tenantSlug: string;
}

export interface ThemeFooterProps {
  tenantSlug: string;
}

export interface ThemeCartDrawerProps {
  tenantSlug: string;
  whatsappNumber: string;
  brandName?: string;
}

/** app/[tenant]/(storefront)/page.tsx — the home page. The Theme decides which sections to show and in what order; it derives any per-section slices (e.g. "nuevos"/"destacados"/"ofertas") itself from `products`/`categories`. */
export interface ThemeHomeProps {
  tenantSlug: string;
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  heroSlides: HeroSlide[];
}

/** app/[tenant]/(storefront)/catalogo/page.tsx — the full catalog. */
export interface ThemeCatalogProps {
  tenantId: string;
  tenantSlug: string;
  filters: CatalogFilters;
  eyebrow: string;
  title: string;
  description?: string;
}

/** app/[tenant]/(storefront)/[category]/page.tsx — one category's listing. */
export interface ThemeCategoryProps {
  tenantId: string;
  tenantSlug: string;
  category: Category;
  filters: CatalogFilters;
  forcedCategorySlugs: string[];
  settings: SiteSettings;
}

/** app/[tenant]/(storefront)/producto/[slug]/page.tsx — one product's detail page. */
export interface ThemeProductDetailProps {
  tenantSlug: string;
  product: Product;
  category: Category | null;
  related: Product[];
  settings: SiteSettings;
}

/**
 * A Theme module's full export surface. Every Theme component below is an
 * async Server Component (same as Theme 01's) — they fetch nothing of
 * their own beyond what's already fetched by the route and handed down as
 * props, except NSCatalogView-style composition where the Theme itself
 * queries products/categories for filtering (same as Theme 01 does today).
 */
export interface ThemeModule {
  Header: (props: ThemeHeaderProps) => Promise<ReactNode> | ReactNode;
  Footer: (props: ThemeFooterProps) => Promise<ReactNode> | ReactNode;
  CartDrawer: (props: ThemeCartDrawerProps) => ReactNode;
  Home: (props: ThemeHomeProps) => ReactNode;
  Catalog: (props: ThemeCatalogProps) => Promise<ReactNode> | ReactNode;
  Category: (props: ThemeCategoryProps) => ReactNode;
  ProductDetail: (props: ThemeProductDetailProps) => ReactNode;
}

/** Tenant-facing label + description for a Theme, shown wherever a human picks one (Super Admin's selector today; Tenant Admin's future plan-gated picker). */
export interface ThemeMeta {
  key: ThemeKey;
  label: string;
  description: string;
}
