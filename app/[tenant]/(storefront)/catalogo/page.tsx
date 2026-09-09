import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { resolveTheme } from "@/lib/themes/registry";
import { parseCatalogSearchParams, type SearchParams } from "@/lib/search/catalog-params";

const DEFAULT_CATALOG_DESCRIPTION = "Explora todo el catálogo y encuentra justo lo que buscas.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const settings = await getSettings(tenant.id);
  return {
    title: "Catálogo",
    description: settings.brandDescription || DEFAULT_CATALOG_DESCRIPTION,
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
  const [settings, resolvedParams] = await Promise.all([getSettings(tenant.id), searchParams]);
  const filters = parseCatalogSearchParams(resolvedParams);
  const theme = resolveTheme(tenant.theme);

  return (
    <theme.Catalog
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      filters={filters}
      eyebrow="Catálogo completo"
      title="Todos los productos"
      description={settings.brandDescription || DEFAULT_CATALOG_DESCRIPTION}
    />
  );
}
