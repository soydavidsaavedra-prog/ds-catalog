/**
 * Theme 01's public contract (see lib/themes/types.ts's ThemeModule) — the
 * storefront's original look, frozen as the reference implementation. Every
 * other Theme (see ../theme-ferrecol) implements this same export surface.
 */
export { NSHeader as Header } from "./NSHeader";
export { NSFooter as Footer } from "./NSFooter";
export { NSCartDrawer as CartDrawer } from "./NSCartDrawer";
export { Home } from "./Home";
export { Catalog } from "./Catalog";
export { Category } from "./Category";
export { ProductDetail } from "./ProductDetail";
