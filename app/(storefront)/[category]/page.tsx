import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getDescendantSlugs, listCategories } from "@/lib/repositories/category-repository";
import { NSCatalogView } from "@/components/catalog/NSCatalogView";
import { NSCategoryHero } from "@/components/catalog/NSCategoryHero";
import { parseCatalogSearchParams, type SearchParams } from "@/lib/search/catalog-params";

export async function generateStaticParams() {
  const categories = await listCategories({ activeOnly: true });
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.active) return {};

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.active) notFound();

  const [resolvedParams, forcedCategorySlugs] = await Promise.all([
    searchParams,
    getDescendantSlugs(category.slug),
  ]);
  const filters = parseCatalogSearchParams(resolvedParams);

  return (
    <div>
      <NSCategoryHero category={category} />
      <NSCatalogView
        filters={filters}
        forcedCategorySlugs={forcedCategorySlugs}
        eyebrow="Colección"
        title={category.name}
        description={category.description}
      />
    </div>
  );
}
