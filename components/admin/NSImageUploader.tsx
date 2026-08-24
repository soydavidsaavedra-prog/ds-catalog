"use client";

import { useRef, useState } from "react";
import { NSMedia } from "@/components/ui/NSMedia";

export function NSImageUploader({
  name,
  initialImages,
}: {
  name: string;
  initialImages: string[];
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/admin/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <div className="flex flex-wrap gap-3">
        {images.map((src, index) => (
          <div key={src + index} className="group relative h-24 w-20 overflow-hidden rounded-control border border-border">
            <NSMedia src={src} alt={`Imagen ${index + 1}`} sizes="80px" />
            {index === 0 ? (
              <span className="absolute left-1 top-1 rounded bg-ink-950/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-ink-0">
                Principal
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
              aria-label="Quitar imagen"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/80 text-ink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-control border border-dashed border-border-strong text-muted-foreground transition-colors hover:border-accent-strong hover:text-accent-strong disabled:opacity-50"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-[10px] font-medium uppercase">{uploading ? "Subiendo..." : "Agregar"}</span>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      <p className="mt-2 text-xs text-muted-foreground">
        La primera imagen es la principal. Sin imágenes, se usa un placeholder de marca.
      </p>
    </div>
  );
}
