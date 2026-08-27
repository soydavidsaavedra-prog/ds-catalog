/**
 * Theme 02 — boutique-hardware-store premium presentation over the
 * exact same catalog engine, cart, and WhatsApp logic every Theme shares.
 * CartDrawer is Theme 01's own: it's already fully token-driven with no
 * Theme-01-specific branding, so it reskins correctly under the
 * .theme-02 scope (app/globals.css) with zero changes — genuine
 * reuse, not a placeholder.
 */
export { Header } from "./Header";
export { Footer } from "./Footer";
export { NSCartDrawer as CartDrawer } from "@/components/storefront/themes/theme-01/NSCartDrawer";
export { Home } from "./Home";
export { Catalog } from "./Catalog";
export { Category } from "./Category";
export { ProductDetail } from "./ProductDetail";
