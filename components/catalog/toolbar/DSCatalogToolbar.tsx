"use client";

import type { ProductSort } from "@/engines/search/search.engine";

import DSSearchInput from "@/components/search/DSSearchInput";
import DSBrandFilter from "@/components/search/DSBrandFilter";
import DSSortSelect from "@/components/search/DSSortSelect";

type Props = {
  query: string;
  brand: string;
  brands: string[];

  sort: ProductSort;

  onQueryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onSortChange: (value: ProductSort) => void;
};

export default function DSCatalogToolbar({
  query,
  brand,
  brands,
  sort,
  onQueryChange,
  onBrandChange,
  onSortChange,
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row">
      <div className="flex-1">
        <DSSearchInput
          value={query}
          onChange={onQueryChange}
        />
      </div>

      <DSBrandFilter
        brands={brands}
        value={brand}
        onChange={onBrandChange}
      />

      <DSSortSelect
        value={sort}
        onChange={onSortChange}
      />
    </div>
  );
}