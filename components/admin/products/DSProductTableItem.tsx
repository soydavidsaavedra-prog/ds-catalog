import Image from "next/image";

import type { Product } from "@/types/product";

import { productImageEngine } from "@/engines/products/product-image.engine";

type Props = {
  product: Product;
};

export default function DSProductTableItem({
  product,
}: Props) {
  const image =
    productImageEngine.getPrimaryImage(product);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-gray-100">
        {image ? (
          <Image
            src={image.path}
            alt={image.alt}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-gray-900">
            {product.name}
          </p>

          {product.featured && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Destacado
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">
          SKU: {product.sku}
        </p>
      </div>
    </div>
  );
}