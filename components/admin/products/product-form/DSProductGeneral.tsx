"use client";

import DSSlugField from "@/components/ui/form/DSSlugField";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import type { ProductFormValues } from "@/schemas/product.schema";

import DSFormGrid from "@/components/ui/form/DSFormGrid";
import DSFormInput from "@/components/ui/form/DSFormInput";
import DSFormSection from "@/components/ui/form/DSFormSection";

export default function DSProductGeneral() {
  const { watch, setValue } =
    useFormContext<ProductFormValues>();

  const name = watch("name");

  useEffect(() => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    setValue("slug", slug);
  }, [name, setValue]);

  return (
    <DSFormSection
      title="Información General"
      description="Datos principales del producto."
    >
      <div className="space-y-6">

        <DSFormInput
          name="name"
          label="Nombre"
          required
          placeholder="Nike Air Max 90"
        />

         <DSSlugField />

        <DSFormGrid>

          <DSFormInput
            name="sku"
            label="SKU"
            placeholder="NK-AM90-001"
          />

          <DSFormInput
            name="brand"
            label="Marca"
            placeholder="Nike"
          />

        </DSFormGrid>

        <DSFormInput
          name="category"
          label="Categoría"
          placeholder="Running"
        />

      </div>
    </DSFormSection>
  );
}