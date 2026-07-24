"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/types/product";

import DSProductCard from "@/components/product/card/DSProductCard";
import DSSearchInput from "@/components/search/DSSearchInput";
import DSBrandFilter from "@/components/search/DSBrandFilter";

import { searchEngine } from "@/engines/search/search.engine";

type Props = {
  products: Product[];
};

export default function DSProductGrid({
  products: allProducts,
}: Props) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");

  const brands = useMemo(() => {
    return searchEngine.getBrands(allProducts);
  }, [allProducts]);

  const products = useMemo(() => {
    let result = searchEngine.search(
      allProducts,
      query
    );

    if (brand) {
      result = result.filter(
        (product) => product.brand === brand
      );
    }

    return result;
  }, [allProducts, query, brand]);

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <DSSearchInput
            value={query}
            onChange={setQuery}
          />
        </div>

        <DSBrandFilter
          brands={brands}
          value={brand}
          onChange={setBrand}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <DSProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}