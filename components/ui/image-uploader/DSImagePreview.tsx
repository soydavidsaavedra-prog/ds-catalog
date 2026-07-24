"use client";

import Image from "next/image";
import { Star, X } from "lucide-react";

import type { ProductImage } from "@/types/product-image";
import { mediaRepository } from "@/engines/media/media.repository";

type Props = {
  images: ProductImage[];

  onRemove?: (image: ProductImage) => void;

  onSetPrimary?: (image: ProductImage) => void;
};

export default function DSImagePreview({
  images,
  onRemove,
  onSetPrimary,
}: Props) {
  if (images.length === 0) return null;

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {images.map((image, index) => {
        const isPrimary = index === 0;

        return (
          <div
            key={`${image.path}-${index}`}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
              isPrimary
                ? "border-yellow-400"
                : "border-gray-200"
            }`}
          >
            <Image
              src={mediaRepository.getPublicUrl(
                "products",
                image.path
              )}
              alt={image.alt || ""}
              fill
              className="object-cover"
            />

            {/* Imagen principal */}
            {isPrimary ? (
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-black shadow">
                <Star size={14} fill="currentColor" />
                Portada
              </div>
            ) : (
              onSetPrimary && (
                <button
                  type="button"
                  onClick={() => onSetPrimary(image)}
                  className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-yellow-600 shadow transition hover:bg-yellow-400 hover:text-black"
                  title="Convertir en portada"
                >
                  <Star size={16} />
                </button>
              )
            )}

            {/* Eliminar */}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(image)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700"
                title="Eliminar imagen"
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}