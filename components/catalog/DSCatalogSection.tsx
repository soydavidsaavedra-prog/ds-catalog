"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/types/product";
import type { ProductSort } from "@/engines/search/search.engine";

import { searchEngine } from "@/engines/search/search.engine";

import DSCatalogToolbar from "@/components/catalog/toolbar/DSCatalogToolbar";
import DSProductGrid from "@/components/catalog/grid/DSProductGrid";

type Props = {
  products: Product[];
};

export default function DSCatalogSection({
  products: allProducts,
}: Props) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");

  const [category] = useState("");
  const [sort, setSort] =
    useState<ProductSort>("newest");
  const [onlyAvailable] =
    useState(false);

  const brands = useMemo(() => {
    return searchEngine.getBrands(allProducts);
  }, [allProducts]);

  const products = useMemo(() => {
    return searchEngine.filterProducts({
      products: allProducts,
      query,
      brand,
      category,
      sort,
      onlyAvailable,
    });
  }, [
    allProducts,
    query,
    brand,
    category,
    sort,
    onlyAvailable,
  ]);

  return (
    <>
      <DSCatalogToolbar
        query={query}
        brand={brand}
        brands={brands}
        sort={sort}
        onQueryChange={setQuery}
        onBrandChange={setBrand}
        onSortChange={setSort}
      />

      <div className="mb-4 text-sm text-gray-500">
        {products.length} producto
        {products.length !== 1 ? "s" : ""} encontrado
        {products.length !== 1 ? "s" : ""}
      </div>

      <DSProductGrid
        products={products}
      />
    </>
  );
}