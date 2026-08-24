import type { Metadata } from "next";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { siteConfig } from "@/lib/config/site";
import { NSHero } from "@/components/home/NSHero";
import { NSFactoryStory } from "@/components/home/NSFactoryStory";
import { NSCollections } from "@/components/home/NSCollections";
import { NSFeaturedProducts } from "@/components/home/NSFeaturedProducts";
import { NSBrandStatement } from "@/components/home/NSBrandStatement";

export const metadata: Metadata = {
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.defaultDescription,
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [categories, products, settings] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({ activeOnly: true }),
    getSettings(),
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
        ctaHref={settings.heroCtaHref}
        image={settings.heroImage}
        imagePositionX={settings.heroImagePositionX}
        imagePositionY={settings.heroImagePositionY}
      />
      <NSFactoryStory />
      <NSCollections topLevelCategories={topLevelCategories} subcategories={subcategories} />
      <NSFeaturedProducts
        nuevos={nuevos}
        destacados={destacados}
        ofertas={ofertas}
        paymentBadge={{ icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel }}
      />
      <NSBrandStatement />
    </>
  );
}
