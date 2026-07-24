"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";

import DSFormGrid from "@/components/ui/form/DSFormGrid";
import DSFormInput from "@/components/ui/form/DSFormInput";
import DSFormSection from "@/components/ui/form/DSFormSection";

export default function DSProductPricing() {
  const { watch } =
    useFormContext<ProductFormValues>();

  const price = watch("price");
  const compareAtPrice = watch("compareAtPrice");

  const discount = useMemo(() => {
    if (
      compareAtPrice <= 0 ||
      compareAtPrice <= price
    ) {
      return 0;
    }

    return Math.round(
      ((compareAtPrice - price) /
        compareAtPrice) *
        100
    );
  }, [price, compareAtPrice]);

  return (
    <DSFormSection
      title="Precios"
      description="Configura el precio del producto."
    >
      <div className="space-y-6">

        <DSFormGrid>

          <DSFormInput
            name="price"
            label="Precio"
            type="number"
            required
            placeholder="25"
          />

          <DSFormInput
            name="compareAtPrice"
            label="Precio anterior"
            type="number"
            placeholder="35"
          />

        </DSFormGrid>

        <div className="rounded-xl border bg-gray-50 p-4">

          <p className="text-sm text-gray-500">
            Descuento calculado
          </p>

          <p className="mt-2 text-3xl font-bold">

            {discount}% OFF

          </p>

        </div>

      </div>
    </DSFormSection>
  );
}