import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { NSCatalogView } from "@/components/catalog/NSCatalogView";
import { parseCatalogSearchParams, type SearchParams } from "@/lib/search/catalog-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  return {
    title: "Catálogo",
    description: "Explora todo el catálogo de jeans y ropa. Filtra por categoría, talla, color y disponibilidad.",
    alternates: { canonical: `/${tenantSlug}/catalogo` },
  };
}

export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const resolvedParams = await searchParams;
  const filters = parseCatalogSearchParams(resolvedParams);

  return (
    <NSCatalogView
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      filters={filters}
      eyebrow="Catálogo completo"
      title="Todos los productos"
      description="De la fábrica a tus manos: jeans, franelas, camisas, chaquetas y más."
    />
  );
}
