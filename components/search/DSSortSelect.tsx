"use client";

import type { ProductSort } from "@/engines/search/search.engine";

type Props = {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
};

export default function DSSortSelect({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value as ProductSort)
      }
      className="rounded-xl border border-gray-300 px-4 py-3"
    >
      <option value="newest">
        Más recientes
      </option>

      <option value="name-asc">
        Nombre (A-Z)
      </option>

      <option value="name-desc">
        Nombre (Z-A)
      </option>

      <option value="price-asc">
        Precio: menor a mayor
      </option>

      <option value="price-desc">
        Precio: mayor a menor
      </option>
    </select>
  );
}