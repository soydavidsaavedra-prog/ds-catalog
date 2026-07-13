"use client";

import { useEffect, useState } from "react";
import type { ProductVariant } from "@/types/product";
import DSWhatsAppButton from "./DSWhatsAppButton";

type Props = {
  productName: string;
  variants: ProductVariant[];
};

export default function DSProductVariants({
  productName,
  variants,
}: Props) {
  const [selectedColor, setSelectedColor] = useState(variants[0]);
  const [selectedSize, setSelectedSize] = useState<number>();

  useEffect(() => {
    setSelectedSize(selectedColor.sizes[0]);
  }, [selectedColor]);

  return (
    <div className="space-y-6">

      <div>
        <h3 className="mb-3 font-semibold">
          Color
        </h3>

        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.color}
              onClick={() => setSelectedColor(variant)}
              className={`rounded-xl border px-4 py-2 transition ${
                selectedColor.color === variant.color
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {variant.color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">
          Talla
        </h3>

        <div className="flex flex-wrap gap-2">
          {selectedColor.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`rounded-xl border px-4 py-2 transition ${
                selectedSize === size
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <DSWhatsAppButton
        productName={productName}
        color={selectedColor.color}
        size={selectedSize}
      />

    </div>
  );
}