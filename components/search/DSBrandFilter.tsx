"use client";

type Props = {
  brands: string[];
  value: string;
  onChange: (brand: string) => void;
};

export default function DSBrandFilter({
  brands,
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-gray-300 px-4 py-3"
    >
      <option value="">Todas las marcas</option>

      {brands.map((brand) => (
        <option
          key={brand}
          value={brand}
        >
          {brand}
        </option>
      ))}
    </select>
  );
}