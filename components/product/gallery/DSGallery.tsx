"use client";

import { useState } from "react";
import DSGalleryMain from "./DSGalleryMain";
import DSGalleryThumbs from "./DSGalleryThumbs";

type Props = {
  images: string[];
  name: string;
};

export default function DSGallery({
  images,
  name,
}: Props) {
  const [current, setCurrent] = useState(0);

  return (
    <div>
      <DSGalleryMain
        image={images[current]}
        alt={name}
      />

      <DSGalleryThumbs
        images={images}
        current={current}
        onChange={setCurrent}
      />
    </div>
  );
}