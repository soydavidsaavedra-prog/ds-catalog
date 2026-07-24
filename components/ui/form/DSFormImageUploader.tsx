"use client";

import { useFormContext } from "react-hook-form";

import type { ProductImage } from "@/types/product-image";
import type { ProductFormValues } from "@/schemas/product.schema";

import DSImageUploader from "@/components/ui/image-uploader/DSImageUploader";

type Props = {
  name: "images";
  bucket: string;
};

export default function DSFormImageUploader({
  name,
  bucket,
}: Props) {
  const { watch, setValue } =
    useFormContext<ProductFormValues>();

  const images =
    watch(name) as ProductImage[];

  const slug = watch("slug");

  return (
    <DSImageUploader
      bucket={bucket}
      folder={slug || "temp"}
      value={images}
      onChange={(images) =>
        setValue(name, images)
      }
    />
  );
}