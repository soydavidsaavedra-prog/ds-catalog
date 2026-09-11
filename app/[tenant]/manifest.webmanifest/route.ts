import { NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/repositories/tenant-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { parsePlaceholder } from "@/lib/media/placeholder";

/** Shown until a tenant uploads their own logo (SiteSettings.brandLogo) — same idea as NSLogo's generated fallback, but manifest icons must be a real raster file, not an SVG component. */
const FALLBACK_ICON = "/ds-catalog-mark.png";

/**
 * A per-tenant Web App Manifest, so "Agregar a inicio" on a tenant's own
 * storefront installs THEIR catalog — their name, their logo, their
 * accent color — not a generic "DS Catalog" app. Linked from
 * app/[tenant]/(storefront)/layout.tsx's generateMetadata.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return new NextResponse("Not found", { status: 404 });

  const settings = await getSettings(tenant.id);
  const hasRealLogo = Boolean(settings.brandLogo) && !parsePlaceholder(settings.brandLogo);
  const themeColor = settings.accentColor ?? "#00a19a";

  const icons = hasRealLogo
    ? [192, 512].map((size) => ({ src: settings.brandLogo, sizes: `${size}x${size}`, purpose: "any" as const }))
    : [192, 512].map((size) => ({
        src: FALLBACK_ICON,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      }));

  const manifest = {
    id: `/${tenantSlug}`,
    name: settings.brandName,
    short_name: settings.brandName,
    description: settings.brandDescription || undefined,
    start_url: `/${tenantSlug}`,
    scope: `/${tenantSlug}/`,
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: themeColor,
    icons,
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
