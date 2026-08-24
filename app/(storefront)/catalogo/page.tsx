import type { Metadata } from "next";
import { NSCatalogView } from "@/components/catalog/NSCatalogView";
import { parseCatalogSearchParams, type SearchParams } from "@/lib/search/catalog-params";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora todo el catálogo de jeans y ropa El Nuevo Sánchez. Filtra por categoría, talla, color y disponibilidad.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseCatalogSearchParams(resolvedParams);

  return (
    <NSCatalogView
      filters={filters}
      eyebrow="Catálogo completo"
      title="Todos los productos"
      description="De la fábrica a tus manos: jeans, franelas, camisas, chaquetas y más."
    />
  );
}
