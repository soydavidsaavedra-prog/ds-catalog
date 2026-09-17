import { DSLoadingScreen } from "@/components/brand/DSLoadingScreen";

/**
 * Pins the whole tenant subtree (storefront + admin) to the plain
 * `DSLoadingScreen` — the same screen it already received from the root
 * app/loading.tsx before that one switched to the richer, marketing-only
 * `DSMarketingLoadingScreen`. Without this file, a tenant route lacking
 * its own loading.tsx (i.e. everything except
 * app/[tenant]/(storefront)/catalogo, which has its own `NSCatalogSkeleton`)
 * would inherit that root boundary instead. Behavior here is unchanged
 * from before — this file exists to keep it that way on purpose.
 */
export default function Loading() {
  return <DSLoadingScreen />;
}
