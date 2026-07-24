"use client";

import { useState } from "react";

import type { ProductImage } from "@/types/product-image";

import { mediaEngine } from "@/engines/media/media.engine";

import DSUploadButton from "./DSUploadButton";
import DSImagePreview from "./DSImagePreview";

type Props = {
  bucket: string;
  folder: string;

  value: ProductImage[];

  onChange: (images: ProductImage[]) => void;
};

export default function DSImageUploader({
  bucket,
  folder,
  value,
  onChange,
}: Props) {
  const [uploading, setUploading] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  async function handleSelect(
    files: FileList | null
  ) {
    if (!files) return;

    setUploading(true);

    try {
      const uploaded: ProductImage[] = [];

      for (const file of Array.from(files)) {
        const result =
          await mediaEngine.upload({
            bucket,
            folder,
            file,
          });

        uploaded.push({
          path: result.path,
          alt: "",
        });
      }

      onChange([
        ...value,
        ...uploaded,
      ]);

    } catch (error) {
      console.error(error);

      alert(
        "Ocurrió un error al subir las imágenes."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(
    image: ProductImage
  ) {
    const confirmed = window.confirm(
      "¿Deseas eliminar esta imagen?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await mediaEngine.delete({
        bucket,
        path: image.path,
      });

      onChange(
        value.filter(
          (item) => item.path !== image.path
        )
      );

    } catch (error) {
      console.error(error);

      alert(
        "No fue posible eliminar la imagen."
      );

    } finally {
      setDeleting(false);
    }
  }

  function handleSetPrimary(
    image: ProductImage
  ) {
    const reordered = [
      image,
      ...value.filter(
        (item) => item.path !== image.path
      ),
    ];

    onChange(reordered);
  }

  return (
    <div className="space-y-4">

      <DSUploadButton
        disabled={uploading || deleting}
        onSelect={handleSelect}
      />

      {(uploading || deleting) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          {uploading
            ? "Subiendo imágenes..."
            : "Eliminando imagen..."}
        </div>
      )}

      <DSImagePreview
        images={value}
        onRemove={handleRemove}
        onSetPrimary={handleSetPrimary}
      />

    </div>
  );
}