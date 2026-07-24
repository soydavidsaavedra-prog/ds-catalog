"use client";

import Image from "next/image";
import { useFormContext } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";
import type { ProductImage } from "@/types/product-image";

type Props = {
  variantIndex: number;
};

export default function DSVariantImageSelector({
  variantIndex,
}: Props) {
  const { watch, setValue } =
    useFormContext<ProductFormValues>();

  const images =
    (watch("images") as ProductImage[]) ?? [];

  const selected =
    watch(`variants.${variantIndex}.image`);

  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-5 text-center text-sm text-gray-500">
        Primero agrega imágenes al producto.
      </div>
    );
  }

  return (
    <div>

      <p className="mb-3 text-sm font-medium">
        Imagen del color
      </p>

      <div className="grid grid-cols-3 gap-3">

        {images.map((image) => (

          <button
            key={image.path}
            type="button"
            onClick={() =>
              setValue(
                `variants.${variantIndex}.image`,
                image.path
              )
            }
            className={`overflow-hidden rounded-lg border-2 transition

              ${
                selected === image.path
                  ? "border-blue-600"
                  : "border-gray-200 hover:border-gray-400"
              }`}
          >

            <Image
              src={image.path}
              alt={image.alt}
              width={150}
              height={150}
              className="aspect-square object-cover"
            />

          </button>

        ))}

      </div>

    </div>
  );
} 