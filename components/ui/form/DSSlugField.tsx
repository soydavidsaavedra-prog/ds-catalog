"use client";

import { useFormContext } from "react-hook-form";
import type { ProductFormValues } from "@/schemas/product.schema";

import DSInput from "@/components/ui/DSInput";

export default function DSSlugField() {
  const { watch, setValue } =
    useFormContext<ProductFormValues>();

  const slug = watch("slug");

  function regenerateSlug() {
    const name = watch("name");

    const generated = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    setValue("slug", generated);
  }

  return (
    <div className="space-y-2">

      <DSInput
        label="Slug"
        value={slug}
        onChange={(e) =>
          setValue("slug", e.target.value)
        }
      />

      <div className="flex items-center justify-between">

        <p className="text-xs text-gray-500">
          URL:
          <span className="ml-1 font-medium">
            /product/{slug || "..."}
          </span>
        </p>

        <button
          type="button"
          onClick={regenerateSlug}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Regenerar
        </button>

      </div>

    </div>
  );
}