import type { Product } from "@/types/product";

import DSProductCard from "@/components/product/card/DSProductCard";

type Props = {
  products: Product[];
};

export default function DSProductGrid({
  products,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            No encontramos productos
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Intenta otra búsqueda o elimina algunos filtros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <DSProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}