"use client";

import { useRef, useState } from "react";
import { NSMedia } from "@/components/ui/NSMedia";
import { compressImageBeforeUpload } from "@/lib/utils/image-compress";

/**
 * Single-image upload field (logo, payment badge icon, hero background...).
 * Uploads straight to /admin/api/upload (Supabase Storage) and stores the
 * resulting URL in a hidden input so it submits with the surrounding form.
 */
export function NSSingleImageUploader({
  tenantSlug,
  name,
  initialValue,
  label = "Subir imagen",
  onChange,
}: {
  tenantSlug: string;
  name: string;
  initialValue?: string;
  label?: string;
  /** Called with the new URL on upload, and with "" on remove — for a parent that wants to mirror the value (e.g. a live preview). */
  onChange?: (url: string) => void;
}) {
  const [value, setValueState] = useState(initialValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setValue(url: string) {
    setValueState(url);
    onChange?.(url);
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", await compressImageBeforeUpload(file));
      const res = await fetch(`/${tenantSlug}/admin/api/upload`, { method: "POST", body: formData });
      // A platform-level rejection (e.g. request too grande) comes back as
      // plain text, not JSON — don't let that surface as a raw parse error.
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error ?? `No se pudo subir la imagen (${res.status}).`);
      setValue(data.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-3">
        {value ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-control border border-border bg-surface">
            <NSMedia src={value} alt="" sizes="56px" />
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-10 items-center justify-center rounded-control border border-dashed border-border-strong px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-accent-strong hover:text-accent-strong disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : label}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="text-xs font-medium text-muted-foreground hover:text-danger"
          >
            Quitar
          </button>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
