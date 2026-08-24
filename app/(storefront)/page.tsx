import type { Metadata } from "next";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
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
  const [categories, products] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({ activeOnly: true }),
  ]);

  const nuevos = products.filter((p) => p.isNew);
  const destacados = products.filter((p) => p.featured);
  const ofertas = products.filter((p) => p.onSale);

  return (
    <>
      <NSHero />
      <NSFactoryStory />
      <NSCollections categories={categories} />
      <NSFeaturedProducts nuevos={nuevos} destacados={destacados} ofertas={ofertas} />
      <NSBrandStatement />
    </>
  );
}
