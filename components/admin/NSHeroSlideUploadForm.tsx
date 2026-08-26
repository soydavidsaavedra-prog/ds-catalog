"use client";

import { useRef, useState } from "react";
import { createHeroSlideAction } from "@/app/[tenant]/admin/actions";
import { compressImageBeforeUpload } from "@/lib/utils/image-compress";
import { NSLabel } from "@/components/ui/NSInput";

/**
 * A slide is created in one step (upload the file, then submit) rather
 * than useActionState's error-round-trip pattern used elsewhere — there's
 * nothing to validate server-side beyond what the upload route itself
 * already rejects (bad type/too large), so a plain client-side
 * try/catch around fetch is enough.
 */
export function NSHeroSlideUploadForm({
  tenantId,
  tenantSlug,
  nextOrder,
  atCap,
  maxSlides,
}: {
  tenantId: string;
  tenantSlug: string;
  nextOrder: number;
  /** True once the tenant already has `maxSlides` slides — hides the upload control instead of letting a request fail server-side. */
  atCap: boolean;
  maxSlides: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const isVideo = file.type.startsWith("video/");
      const toUpload = isVideo ? file : await compressImageBeforeUpload(file);

      const uploadForm = new FormData();
      uploadForm.append("file", toUpload);
      const res = await fetch(`/${tenantSlug}/admin/api/upload`, { method: "POST", body: uploadForm });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir el archivo");

      const createForm = new FormData();
      createForm.set("mediaUrl", data.url as string);
      createForm.set("mediaType", isVideo ? "video" : "image");
      createForm.set("positionX", "50");
      createForm.set("positionY", "50");
      createForm.set("order", String(nextOrder));
      createForm.set("active", "on");
      await createHeroSlideAction(tenantId, tenantSlug, createForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (atCap) {
    return (
      <p className="text-xs text-muted-foreground">
        Ya tienes {maxSlides} fotos/videos, el máximo permitido. Elimina alguno para agregar otro.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, AVIF (hasta 8MB) o MP4/WEBM (hasta 4MB).</p>
      <div className="mt-2 flex items-center gap-3">
        <NSLabel className="sr-only" htmlFor="hero-slide-file">
          Archivo
        </NSLabel>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-10 items-center justify-center rounded-control border border-dashed border-border-strong px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-accent-strong hover:text-accent-strong disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Agregar foto o video"}
        </button>
        <input
          ref={fileInputRef}
          id="hero-slide-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
