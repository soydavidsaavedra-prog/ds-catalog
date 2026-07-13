"use client";

import Image from "next/image";

type Props = {
  images: string[];
  current: number;
  onChange: (index: number) => void;
};

export default function DSGalleryThumbs({
  images,
  current,
  onChange,
}: Props) {
  return (
    <div className="mt-4 flex gap-3">
      {images.map((image, index) => (
        <button
          key={image}
          onClick={() => onChange(index)}
          className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${
            current === index
              ? "border-black"
              : "border-gray-200"
          }`}
        >
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}