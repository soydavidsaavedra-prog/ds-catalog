import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { siteConfig } from "@/lib/config/site";
import { NSHero } from "@/components/home/NSHero";
import { NSFactoryStory } from "@/components/home/NSFactoryStory";
import { NSCollections } from "@/components/home/NSCollections";
import { NSFeaturedProducts } from "@/components/home/NSFeaturedProducts";
import { NSBrandStatement } from "@/components/home/NSBrandStatement";

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

  const [categories, products, settings] = await Promise.all([
    listCategories(tenant.id, { activeOnly: true }),
    listProducts(tenant.id, { activeOnly: true }),
    getSettings(tenant.id),
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
