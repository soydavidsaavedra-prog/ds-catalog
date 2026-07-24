"use client";

import { useFormContext } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";

import DSFormInput from "@/components/ui/form/DSFormInput";
import DSFormSection from "@/components/ui/form/DSFormSection";
import DSFormCheckbox from "@/components/ui/form/DSFormCheckbox";

export default function DSProductInventory() {
  const { watch } =
    useFormContext<ProductFormValues>();

  const stock = watch("stock");

  const inventoryStatus =
    stock <= 0
      ? {
          title: "Agotado",
          description:
            "No hay unidades disponibles para la venta.",
          className:
            "border-red-200 bg-red-50 text-red-700",
          icon: "🔴",
        }
      : stock <= 10
      ? {
          title: "Stock bajo",
          description:
            "Se recomienda reponer inventario pronto.",
          className:
            "border-yellow-200 bg-yellow-50 text-yellow-700",
          icon: "🟡",
        }
      : {
          title: "Disponible",
          description:
            "El inventario se encuentra en buen estado.",
          className:
            "border-green-200 bg-green-50 text-green-700",
          icon: "🟢",
        };

  return (
    <DSFormSection
      title="Inventario"
      description="Estado y disponibilidad del producto."
    >
      <div className="space-y-6">

        <div className="relative">

          <DSFormInput
            name="stock"
            label="Stock total"
            type="number"
            placeholder="0"
            required
            disabled
          />

          <p className="mt-2 text-xs text-gray-500">
            Este valor se calcula automáticamente a partir del
            stock de todas las variantes y tallas.
          </p>

        </div>

        <div
          className={`rounded-xl border p-5 ${inventoryStatus.className}`}
        >
          <div className="flex items-center gap-3">

            <span className="text-2xl">
              {inventoryStatus.icon}
            </span>

            <div>

              <p className="font-semibold text-lg">
                {inventoryStatus.title}
              </p>

              <p className="text-sm opacity-80">
                {inventoryStatus.description}
              </p>

            </div>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">

            <div className="rounded-lg bg-white/60 p-3">

              <p className="text-xs uppercase tracking-wide opacity-70">
                Stock Total
              </p>

              <p className="mt-1 text-2xl font-bold">
                {stock}
              </p>

            </div>

            <div className="rounded-lg bg-white/60 p-3">

              <p className="text-xs uppercase tracking-wide opacity-70">
                Estado
              </p>

              <p className="mt-1 text-lg font-semibold">
                {inventoryStatus.title}
              </p>

            </div>

          </div>

        </div>

        <DSFormCheckbox
          name="active"
          label="Producto activo"
        />

        <DSFormCheckbox
          name="featured"
          label="Producto destacado"
        />

      </div>
    </DSFormSection>
  );
}