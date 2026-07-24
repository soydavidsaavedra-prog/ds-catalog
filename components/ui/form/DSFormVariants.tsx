"use client";

import { useFormContext } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";
import type { ProductVariant } from "@/types/product";

import DSVariantCard from "./DSVariantCard";

export default function DSFormVariants() {
  const { watch, setValue } =
    useFormContext<ProductFormValues>();

  const variants =
    (watch("variants") as ProductVariant[]) ?? [];

  function addVariant() {
    setValue("variants", [
      ...variants,
      {
        id: crypto.randomUUID(),
        color: "",
        image: "",
        sizes: [],
      },
    ]);
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Variantes
          </h2>

          <p className="text-sm text-gray-500">
            Administra colores, imágenes, tallas, stock y SKU.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Agregar color
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
          Este producto aún no tiene variantes.
        </div>
      ) : (
        <div className="space-y-6">
          {variants.map((variant, index) => (
            <DSVariantCard
              key={variant.id}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}