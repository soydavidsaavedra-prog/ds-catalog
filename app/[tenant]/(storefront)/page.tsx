import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { listHeroSlides } from "@/lib/repositories/hero-slide-repository";
import { siteConfig } from "@/lib/config/site";
import { resolveTheme } from "@/lib/themes/registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const settings = await getSettings(tenant.id);
  const title = `${settings.brandName} — ${settings.slogan}`;

  return {
    title,
    description: settings.brandDescription || siteConfig.seo.defaultDescription,
    alternates: { canonical: `/${tenantSlug}` },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  const [categories, products, settings, heroSlides] = await Promise.all([
    listCategories(tenant.id, { activeOnly: true }),
    listProducts(tenant.id, { activeOnly: true }),
    getSettings(tenant.id),
    listHeroSlides(tenant.id, { activeOnly: true }),
  ]);

  const theme = resolveTheme(tenant.theme);

  return (
    <theme.Home
      tenantSlug={tenantSlug}
      settings={settings}
      categories={categories}
      products={products}
      heroSlides={heroSlides}
    />
  );
}
