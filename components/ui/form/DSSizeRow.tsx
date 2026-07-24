"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";

type Props = {
  variantIndex: number;
  sizeIndex: number;
  onRemove: () => void;
};

export default function DSSizeRow({
  variantIndex,
  sizeIndex,
  onRemove,
}: Props) {
  const {
    register,
    watch,
    setValue,
  } = useFormContext<ProductFormValues>();

  const productSku = watch("sku");

  const color =
    watch(`variants.${variantIndex}.color`);

  const sizes =
    watch(`variants.${variantIndex}.sizes`);

  const size =
    watch(
      `variants.${variantIndex}.sizes.${sizeIndex}.size`
    );

  const sku =
    watch(
      `variants.${variantIndex}.sizes.${sizeIndex}.sku`
    );

  useEffect(() => {
    if (!productSku) return;

    const colorCode =
      (color || "GEN")
        .substring(0, 3)
        .toUpperCase();

    const generated =
      `${productSku}-${colorCode}-${size}`;

    if (
      !sku ||
      sku.startsWith(productSku)
    ) {
      setValue(
        `variants.${variantIndex}.sizes.${sizeIndex}.sku`,
        generated
      );
    }

  }, [
    productSku,
    color,
    size,
    sku,
    setValue,
    variantIndex,
    sizeIndex,
  ]);

  const duplicated =
    sizes.filter(
      (item) => item.size === size
    ).length > 1;

  return (
    <div
      className={`grid grid-cols-12 gap-3 items-center rounded-lg border p-3 transition

      ${
        duplicated
          ? "border-red-500 bg-red-50"
          : ""
      }`}
    >

      <input
        type="number"
        {...register(
          `variants.${variantIndex}.sizes.${sizeIndex}.size`,
          {
            valueAsNumber: true,
          }
        )}
        className="col-span-2 rounded-lg border px-3 py-2"
      />

      <input
        type="number"
        {...register(
          `variants.${variantIndex}.sizes.${sizeIndex}.stock`,
          {
            valueAsNumber: true,
          }
        )}
        className="col-span-2 rounded-lg border px-3 py-2"
      />

      <input
        {...register(
          `variants.${variantIndex}.sizes.${sizeIndex}.sku`
        )}
        className="col-span-5 rounded-lg border px-3 py-2"
      />

      <input
        type="number"
        {...register(
          `variants.${variantIndex}.sizes.${sizeIndex}.price`,
          {
            valueAsNumber: true,
          }
        )}
        className="col-span-2 rounded-lg border px-3 py-2"
      />

      <button
        type="button"
        onClick={onRemove}
        className="flex justify-center rounded-lg p-2 text-red-600 hover:bg-red-100"
      >
        <Trash2 size={18} />
      </button>

      {duplicated && (
        <div className="col-span-12 flex items-center gap-2 text-sm text-red-600">

          <AlertCircle size={16} />

          Esta talla ya existe para este color.

        </div>
      )}

    </div>
  );
}