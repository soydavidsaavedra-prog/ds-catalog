"use client";

import { useRef, useState } from "react";
import { createHeroSlideAction } from "@/app/[tenant]/admin/actions";
import { compressImageBeforeUpload } from "@/lib/utils/image-compress";
import { MAX_VIDEO_UPLOAD_BYTES } from "@/lib/media/upload-limits";
import { NSLabel } from "@/components/ui/NSInput";

const MAX_VIDEO_MB = MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024);

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
  atCap,
  maxSlides,
}: {
  tenantId: string;
  tenantSlug: string;
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

    const isVideo = file.type.startsWith("video/");
    // Checked before the request is even sent: a video over this size
    // gets rejected by Vercel's platform-level body-size limit before our
    // own upload route ever runs, coming back as an HTML error page
    // instead of JSON — the confusing "Unexpected token" error. Catching
    // it here means the user gets the real reason instead.
    if (isVideo && file.size > MAX_VIDEO_UPLOAD_BYTES) {
      setError(`El video supera ${MAX_VIDEO_MB}MB. Comprímelo o usa uno más corto.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const toUpload = isVideo ? file : await compressImageBeforeUpload(file);

      const uploadForm = new FormData();
      uploadForm.append("file", toUpload);
      const res = await fetch(`/${tenantSlug}/admin/api/upload`, { method: "POST", body: uploadForm });
      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("El archivo es demasiado grande para subir. Prueba con uno más liviano.");
      }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Error al subir el archivo");

      const createForm = new FormData();
      createForm.set("mediaUrl", data.url);
      createForm.set("mediaType", isVideo ? "video" : "image");
      createForm.set("positionX", "50");
      createForm.set("positionY", "50");
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
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, AVIF (hasta 8MB) o MP4/WEBM (hasta {MAX_VIDEO_MB}MB).</p>
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
