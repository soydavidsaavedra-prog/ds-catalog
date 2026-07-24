"use client";

import Image from "next/image";

type Props = {
  image?: string;
};

export default function DSVariantImage({
  image,
}: Props) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">

      <p className="mb-3 text-sm font-medium">
        Imagen del color
      </p>

      {image ? (
        <Image
          src={image}
          alt="Variante"
          width={220}
          height={220}
          className="aspect-square rounded-lg object-cover"
        />
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
          Sin imagen
        </div>
      )}

      <button
        type="button"
        className="mt-4 w-full rounded-lg border py-2 text-sm hover:bg-gray-100"
      >
        Cambiar imagen
      </button>

    </div>
  );
}