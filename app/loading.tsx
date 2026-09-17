import { DSMarketingLoadingScreen } from "@/components/brand/DSMarketingLoadingScreen";

/**
 * Root-level fallback — Next.js uses the nearest loading.tsx along the
 * render path, so this only shows for a route with no more specific one of
 * its own. That now means: the landing (`/`), `/acceder` (+ recuperar/
 * restablecer), `/registro`, `/terminos`, `/privacidad` — every tenant
 * route (storefront + admin, see app/[tenant]/loading.tsx) and all of
 * Super Admin (app/superadmin/loading.tsx) pin themselves to the plain
 * `DSLoadingScreen` instead, so this richer marketing-flavored screen
 * never reaches a dashboard.
 */
export default function Loading() {
  return <DSMarketingLoadingScreen />;
}
