"use client";

import DSFormSection from "@/components/ui/form/DSFormSection";
import DSFormImageUploader from "@/components/ui/form/DSFormImageUploader";

export default function DSProductMedia() {
  return (
    <DSFormSection
      title="Multimedia"
      description="Imágenes del producto."
    >
      <DSFormImageUploader
        name="images"
        bucket="products"
      />
    </DSFormSection>
  );
}