"use client";

import { useActionState, useRef, useState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import { updateHeroSettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSHero } from "@/components/home/NSHero";

const initialState: ActionState = {};

const PREVIEW_SCALE = 0.32;

export function NSHeroEditorForm({ tenantId, tenantSlug, settings }: { tenantId: string; tenantSlug: string; settings: SiteSettings }) {
  const boundAction = updateHeroSettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    eyebrow: settings.heroEyebrow,
    titleLine1: settings.heroTitleLine1,
    titleLine2: settings.heroTitleLine2,
    subtitle: settings.heroSubtitle,
    tagline: settings.heroTagline,
    ctaLabel: settings.heroCtaLabel,
    ctaHref: settings.heroCtaHref,
    image: settings.heroImage,
    imagePositionX: settings.heroImagePositionX,
    imagePositionY: settings.heroImagePositionY,
  });

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/${tenantSlug}/admin/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");
      set("image", data.url as string);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <form action={formAction} className="flex w-full flex-col gap-5 xl:max-w-md">
        {state.success ? (
          <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
            Portada guardada.
          </div>
        ) : null}

        <div>
          <NSLabel>Imagen de portada</NSLabel>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-10 items-center justify-center rounded-control border border-dashed border-border-strong px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-accent-strong hover:text-accent-strong disabled:opacity-50"
            >
              {uploading ? "Subiendo..." : "Subir desde tu computador"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files)}
            />
          </div>
          {uploadError ? <p className="mt-2 text-xs text-danger">{uploadError}</p> : null}
          <input type="hidden" name="heroImage" value={draft.image} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <NSLabel htmlFor="posX">Posición horizontal de la imagen</NSLabel>
            <input
              id="posX"
              type="range"
              min={0}
              max={100}
              value={draft.imagePositionX}
              onChange={(e) => set("imagePositionX", Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <input type="hidden" name="heroImagePositionX" value={draft.imagePositionX} />
          </div>
          <div>
            <NSLabel htmlFor="posY">Posición vertical de la imagen</NSLabel>
            <input
              id="posY"
              type="range"
              min={0}
              max={100}
              value={draft.imagePositionY}
              onChange={(e) => set("imagePositionY", Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <input type="hidden" name="heroImagePositionY" value={draft.imagePositionY} />
          </div>
        </div>

        <div>
          <NSLabel htmlFor="heroEyebrow">Texto pequeño (arriba del título)</NSLabel>
          <NSInput
            id="heroEyebrow"
            name="heroEyebrow"
            value={draft.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <NSLabel htmlFor="heroTitleLine1">Título — línea 1</NSLabel>
            <NSInput
              id="heroTitleLine1"
              name="heroTitleLine1"
              value={draft.titleLine1}
              onChange={(e) => set("titleLine1", e.target.value)}
            />
          </div>
          <div>
            <NSLabel htmlFor="heroTitleLine2">Título — línea 2 (dorada)</NSLabel>
            <NSInput
              id="heroTitleLine2"
              name="heroTitleLine2"
              value={draft.titleLine2}
              onChange={(e) => set("titleLine2", e.target.value)}
            />
          </div>
        </div>
        <div>
          <NSLabel htmlFor="heroSubtitle">Subtítulo</NSLabel>
          <NSInput
            id="heroSubtitle"
            name="heroSubtitle"
            value={draft.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        </div>
        <div>
          <NSLabel htmlFor="heroTagline">Frase junto al botón</NSLabel>
          <NSInput
            id="heroTagline"
            name="heroTagline"
            value={draft.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <NSLabel htmlFor="heroCtaLabel">Texto del botón</NSLabel>
            <NSInput
              id="heroCtaLabel"
              name="heroCtaLabel"
              value={draft.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
            />
          </div>
          <div>
            <NSLabel htmlFor="heroCtaHref">Link del botón</NSLabel>
            <NSInput
              id="heroCtaHref"
              name="heroCtaHref"
              value={draft.ctaHref}
              onChange={(e) => set("ctaHref", e.target.value)}
            />
          </div>
        </div>

        <NSButton type="submit" loading={pending} className="self-start">
          Guardar portada
        </NSButton>
      </form>

      <div className="w-full xl:flex-1">
        <NSLabel>Vista previa en vivo</NSLabel>
        <div
          className="overflow-hidden rounded-card border border-border"
          style={{ height: 640 * PREVIEW_SCALE }}
        >
          <div
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              width: `${100 / PREVIEW_SCALE}%`,
              height: `${100 / PREVIEW_SCALE}%`,
            }}
          >
            <NSHero {...draft} />
          </div>
        </div>
      </div>
    </div>
  );
}
