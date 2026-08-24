import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveTenant, listActiveTenants } from "@/lib/tenant/resolve-tenant";
import { getCategoryBySlug, getDescendantSlugs, listCategories } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { NSCatalogView } from "@/components/catalog/NSCatalogView";
import { NSCategoryHero } from "@/components/catalog/NSCategoryHero";
import { parseCatalogSearchParams, type SearchParams } from "@/lib/search/catalog-params";

export async function generateStaticParams() {
  const tenants = await listActiveTenants();
  const params: { tenant: string; category: string }[] = [];
  for (const tenant of tenants) {
    const categories = await listCategories(tenant.id, { activeOnly: true });
    for (const category of categories) {
      params.push({ tenant: tenant.slug, category: category.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; category: string }>;
}): Promise<Metadata> {
  const { tenant: tenantSlug, category: slug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const category = await getCategoryBySlug(tenant.id, slug);
  if (!category || !category.active) return {};

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/${tenantSlug}/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string; category: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { tenant: tenantSlug, category: slug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const category = await getCategoryBySlug(tenant.id, slug);
  if (!category || !category.active) notFound();

  const [resolvedParams, forcedCategorySlugs, settings] = await Promise.all([
    searchParams,
    getDescendantSlugs(tenant.id, category.slug),
    getSettings(tenant.id),
  ]);
  const filters = parseCatalogSearchParams(resolvedParams);

  return (
    <div>
      <NSCategoryHero category={category} brandName={settings.brandName} />
      <NSCatalogView
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        filters={filters}
        forcedCategorySlugs={forcedCategorySlugs}
        eyebrow="Colección"
        title={category.name}
        description={category.description}
      />
    </div>
  );
}
