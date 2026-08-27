import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { listHeroSlides } from "@/lib/repositories/hero-slide-repository";
import { siteConfig } from "@/lib/config/site";
import { NSHero } from "@/components/storefront/themes/theme-01/NSHero";
import { NSFactoryStory, DEFAULT_STEP_LABELS } from "@/components/storefront/themes/theme-01/NSFactoryStory";
import { NSCollections } from "@/components/storefront/themes/theme-01/NSCollections";
import { NSFeaturedProducts } from "@/components/storefront/themes/theme-01/NSFeaturedProducts";
import { NSBrandStatement } from "@/components/storefront/themes/theme-01/NSBrandStatement";

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

  const nuevos = products.filter((p) => p.isNew);
  const destacados = products.filter((p) => p.featured);
  const ofertas = products.filter((p) => p.onSale);

  const topLevelCategories = categories.filter((c) => c.parentId === null && c.featured);
  const subcategories = categories.filter((c) => c.parentId !== null);

  return (
    <>
      <NSHero
        eyebrow={settings.heroEyebrow}
        titleLine1={settings.heroTitleLine1}
        titleLine2={settings.heroTitleLine2}
        subtitle={settings.heroSubtitle}
        tagline={settings.heroTagline}
        ctaLabel={settings.heroCtaLabel}
        ctaHref={settings.heroCtaHref.startsWith("/") ? `/${tenantSlug}${settings.heroCtaHref}` : settings.heroCtaHref}
        image={settings.heroImage}
        imagePositionX={settings.heroImagePositionX}
        imagePositionY={settings.heroImagePositionY}
        brandName={settings.brandName}
        slides={heroSlides}
      />
      <NSFactoryStory
        eyebrow={settings.storyEyebrow}
        title={settings.storyTitle}
        description={settings.storyDescription}
        stepImages={[
          settings.storyStepImage1,
          settings.storyStepImage2,
          settings.storyStepImage3,
          settings.storyStepImage4,
          settings.storyStepImage5,
        ]}
        stepLabels={[
          settings.storyStepLabel1 ?? DEFAULT_STEP_LABELS[0],
          settings.storyStepLabel2 ?? DEFAULT_STEP_LABELS[1],
          settings.storyStepLabel3 ?? DEFAULT_STEP_LABELS[2],
          settings.storyStepLabel4 ?? DEFAULT_STEP_LABELS[3],
          settings.storyStepLabel5 ?? DEFAULT_STEP_LABELS[4],
        ]}
        brandName={settings.brandName}
      />
      <NSCollections
        tenantSlug={tenantSlug}
        topLevelCategories={topLevelCategories}
        subcategories={subcategories}
        brandName={settings.brandName}
      />
      <NSFeaturedProducts
        tenantSlug={tenantSlug}
        nuevos={nuevos}
        destacados={destacados}
        ofertas={ofertas}
        paymentBadge={{ icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel }}
        brandName={settings.brandName}
      />
      <NSBrandStatement
        titleLine1={settings.statementTitleLine1}
        titleLine2={settings.statementTitleLine2}
        description={settings.statementDescription}
        image={settings.statementImage}
        brandName={settings.brandName}
      />
    </>
  );
}
