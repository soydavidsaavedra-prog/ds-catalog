import type { ThemeHomeProps } from "@/lib/themes/types";
import { NSHero } from "./NSHero";
import { NSFactoryStory, DEFAULT_STEP_LABELS } from "./NSFactoryStory";
import { NSCollections } from "./NSCollections";
import { NSFeaturedProducts } from "./NSFeaturedProducts";
import { NSBrandStatement } from "./NSBrandStatement";

/** Theme 01's home page composition — moved here verbatim from app/[tenant]/(storefront)/page.tsx, which now just fetches data and renders this. */
export function Home({ tenantSlug, settings, categories, products, heroSlides }: ThemeHomeProps) {
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
