import type { MetadataRoute } from "next";

/**
 * The platform's OWN manifest — for the root landing page (and any route
 * with no more specific override, e.g. /admin, /superadmin). A tenant's
 * storefront overrides this with its own name/logo/accent via
 * app/[tenant]/manifest.webmanifest/route.ts, linked from
 * app/[tenant]/(storefront)/layout.tsx's generateMetadata.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DS Catalog",
    short_name: "DS Catalog",
    description: "DS Catalog aloja catálogos y tiendas conversacionales independientes bajo un solo motor.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a09",
    theme_color: "#0a0a09",
    icons: [
      { src: "/ds-catalog-mark.png", sizes: "192x192", type: "image/png" },
      { src: "/ds-catalog-mark.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
