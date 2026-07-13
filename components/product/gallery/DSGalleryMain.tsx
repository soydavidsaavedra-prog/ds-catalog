"use client";

import Image from "next/image";

type Props = {
  image: string;
  alt: string;
};

export default function DSGalleryMain({ image, alt }: Props) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border">
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}