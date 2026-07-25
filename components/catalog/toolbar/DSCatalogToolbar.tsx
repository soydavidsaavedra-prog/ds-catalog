"use client";

import DSSearchInput from "@/components/search/DSSearchInput";
import DSBrandFilter from "@/components/search/DSBrandFilter";

type Props = {
  query: string;
  brand: string;
  brands: string[];

  onQueryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
};

export default function DSCatalogToolbar({
  query,
  brand,
  brands,
  onQueryChange,
  onBrandChange,
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row">
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
    </div>
  );
}