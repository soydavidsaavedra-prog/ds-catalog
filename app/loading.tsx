import { DSLoadingScreen } from "@/components/brand/DSLoadingScreen";

/**
 * Root-level fallback — Next.js uses the nearest loading.tsx along the
 * render path, so this only shows for a route with no more specific one of
 * its own (e.g. app/[tenant]/(storefront)/catalogo/loading.tsx still shows
 * its own product-grid skeleton instead of this).
 */
export default function Loading() {
  return <DSLoadingScreen />;
}
