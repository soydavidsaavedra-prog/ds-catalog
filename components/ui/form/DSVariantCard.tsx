"use client";

import { Copy, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";

import {
  addVariantSize,
  duplicateVariant,
  generateVariantSizes,
  removeVariant,
  removeVariantSize,
} from "@/lib/variant-engine";

import { getSizeRange } from "@/lib/size-ranges";

import DSVariantImageSelector from "./DSVariantImageSelector";
import DSSizeRow from "./DSSizeRow";

type Props = {
  index: number;
};

export default function DSVariantCard({
  index,
}: Props) {

  const {
    watch,
    register,
    setValue,
  } =
    useFormContext<ProductFormValues>();

  const variants =
    watch("variants");

  const variant =
    variants[index];

  function update(updated: typeof variants) {
    setValue(
      "variants",
      updated,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  }

  function handleAddSize() {
    update(
      addVariantSize(
        variants,
        index,
        {
          id: crypto.randomUUID(),
          size: 35,
          stock: 0,
          sku: "",
          price: undefined,
        }
      )
    );
  }

  function handleGenerateSizes() {

    const range =
      getSizeRange("women");

    update(
      generateVariantSizes(
        variants,
        index,
        range.sizes
      )
    );

  }

  function handleDuplicate() {
    update(
      duplicateVariant(
        variants,
        index
      )
    );
  }

  function handleRemove() {
    update(
      removeVariant(
        variants,
        index
      )
    );
  }

  function handleRemoveSize(
    sizeIndex: number
  ) {
    update(
      removeVariantSize(
        variants,
        index,
        sizeIndex
      )
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-white p-5">

      <div className="flex items-center justify-between">

        <h3 className="text-lg font-semibold">
          Variante #{index + 1}
        </h3>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={handleDuplicate}
            className="rounded-lg border px-3 py-2 hover:bg-gray-100"
          >
            <Copy size={18}/>
          </button>

          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={18}/>
          </button>

        </div>

      </div>

      <div>

        <label className="mb-2 block text-sm font-medium">
          Color
        </label>

        <input
          {...register(
            `variants.${index}.color`
          )}
          className="w-full rounded-lg border px-3 py-2"
        />

      </div>

      <DSVariantImageSelector
        variantIndex={index}
      />

      <div className="space-y-3">

        {variant.sizes.map(
          (_, sizeIndex) => (

            <DSSizeRow
              key={
                variant.sizes[sizeIndex].id
              }
              variantIndex={index}
              sizeIndex={sizeIndex}
              onRemove={() =>
                handleRemoveSize(
                  sizeIndex
                )
              }
            />

          )
        )}

      </div>

      <div className="flex flex-wrap gap-3">

        <button
          type="button"
          onClick={handleAddSize}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          + Agregar talla
        </button>

        <button
          type="button"
          onClick={handleGenerateSizes}
          className="rounded-lg border border-blue-300 px-4 py-2 text-blue-700 hover:bg-blue-50"
        >
          ⚡ Generar tallas
        </button>

      </div>

    </div>
  );
}