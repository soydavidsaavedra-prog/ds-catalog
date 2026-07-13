"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  name: string;
};

export default function DSProductGallery({
  images,
  name,
}: Props) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="space-y-4">

      <div className="relative aspect-square overflow-hidden rounded-2xl border bg-gray-100">
        <Image
          src={selectedImage}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-3">

        {images.map((image) => (

          <button
            key={image}
            onClick={() => setSelectedImage(image)}
            className={`relative aspect-square overflow-hidden rounded-xl border transition ${
              selectedImage === image
                ? "border-black"
                : "border-gray-200"
            }`}
          >
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
            />
          </button>

        ))}

      </div>

    </div>
  );
}