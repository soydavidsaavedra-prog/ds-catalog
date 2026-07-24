"use client";

import { useState } from "react";

import type { ProductImage } from "@/types/product-image";

import DSGalleryMain from "./DSGalleryMain";
import DSGalleryThumbs from "./DSGalleryThumbs";

type Props = {
  images: ProductImage[];
  name: string;
};

export default function DSGallery({
  images,
  name,
}: Props) {
  const [current, setCurrent] = useState(0);

  const currentImage = images[current];

  return (
    <div>
      <DSGalleryMain
        image={currentImage?.path ?? ""}
        alt={currentImage?.alt || name}
      />

      <DSGalleryThumbs
        images={images}
        current={current}
        onChange={setCurrent}
      />
    </div>
  );
}