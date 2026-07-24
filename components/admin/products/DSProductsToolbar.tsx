"use client";

import DSButton from "@/components/ui/DSButton";

type Props = {
  search: string;
  brand: string;
  active: string;

  brands: string[];

  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onActiveChange: (value: string) => void;
};

export default function DSProductsToolbar({
  search,
  brand,
  active,
  brands,
  onSearchChange,
  onBrandChange,
  onActiveChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 lg:flex-row lg:items-center">

      <input
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        placeholder="Buscar productos..."
        className="flex-1 rounded-lg border px-4 py-2"
      />

      <select
        value={brand}
        onChange={(e) =>
          onBrandChange(e.target.value)
        }
        className="rounded-lg border px-4 py-2"
      >
        <option value="">
          Todas las marcas
        </option>

        {brands.map((brand) => (
          <option
            key={brand}
            value={brand}
          >
            {brand}
          </option>
        ))}
      </select>

      <select
        value={active}
        onChange={(e) =>
          onActiveChange(e.target.value)
        }
        className="rounded-lg border px-4 py-2"
      >
        <option value="">
          Todos
        </option>

        <option value="true">
          Activos
        </option>

        <option value="false">
          Inactivos
        </option>

      </select>

      <DSButton>
        Exportar
      </DSButton>

    </div>
  );
}