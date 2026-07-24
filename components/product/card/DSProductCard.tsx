import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types/product";
import { mediaRepository } from "@/engines/media/media.repository";

type Props = {
  product: Product;
};

export default function DSProductCard({
  product,
}: Props) {
  console.log(product);
console.log(product.images);
console.log(product.images[0]);
const firstImage = product.images[0];

console.log("PRODUCT", product);
console.log("IMAGES", product.images);
console.log("FIRST IMAGE", firstImage);

const imageUrl =
  firstImage &&
  typeof firstImage === "object" &&
  "path" in firstImage &&
  firstImage.path
    ? mediaRepository.getPublicUrl(
        "products",
        firstImage.path
      )
    : null;

  return (
    <article className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">

      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={firstImage.alt || product.name}
            fill
            className="object-cover"
          />
        ) : null}

      </div>

      <div className="mt-4">

        <p className="text-sm text-gray-500">
          {product.brand}
        </p>

        <h2 className="mt-1 text-xl font-bold">
          {product.name}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex items-center gap-2">

          <span className="text-2xl font-bold">
            ${product.price}
          </span>

          <span className="text-sm text-gray-400 line-through">
            ${product.compareAtPrice}
          </span>

        </div>

        <Link
          href={`/product/${product.slug}`}
          className="mt-5 block w-full rounded-lg bg-black py-3 text-center text-white transition hover:opacity-90"
        >
          Ver detalles
        </Link>

      </div>

    </article>
  );
}