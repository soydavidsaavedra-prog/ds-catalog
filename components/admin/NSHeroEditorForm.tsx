"use client";

import { useActionState, useState } from "react";
import { MAX_HERO_SLIDES, type HeroSlide, type SiteSettings } from "@/lib/types/catalog";
import { updateHeroSettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { buildAccentOverrideVars } from "@/lib/utils/brand";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSHero } from "@/components/home/NSHero";
import { NSHeroSlideUploadForm } from "@/components/admin/NSHeroSlideUploadForm";
import { NSHeroSlideList } from "@/components/admin/NSHeroSlideList";

const initialState: ActionState = {};

const PREVIEW_SCALE = 0.32;

export function NSHeroEditorForm({
  tenantId,
  tenantSlug,
  settings,
  slides,
}: {
  tenantId: string;
  tenantSlug: string;
  settings: SiteSettings;
  /** Photos/videos that auto-rotate behind the static text below — see /admin/inicio's "Portada (Hero)" section. Empty means the storefront shows just the single image above, unchanged. */
  slides: HeroSlide[];
}) {
  const boundAction = updateHeroSettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

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

  return (
    <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <form action={formAction} className="flex w-full flex-col gap-5 xl:max-w-md">
        {state.success ? (
          <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
            Portada guardada.
          </div>
        ) : null}

        {/* No manual image upload/position control here anymore — Fotos y
            videos (below) is now the one place that manages what's behind
            the portada. These hidden fields just carry the tenant's
            existing background through "Guardar portada" unchanged, so
            saving the text fields never blanks it out. */}
        <input type="hidden" name="heroImage" value={draft.image} />
        <input type="hidden" name="heroImagePositionX" value={draft.imagePositionX} />
        <input type="hidden" name="heroImagePositionY" value={draft.imagePositionY} />

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
        {/* tenant-preview: shows the tenant's real accent/light storefront
            look, not DS Catalog's own dark chrome around it — see
            app/globals.css and lib/utils/brand.ts buildAccentOverrideVars. */}
        <div
          className="tenant-preview overflow-hidden rounded-card border border-border"
          style={{ height: 640 * PREVIEW_SCALE, ...buildAccentOverrideVars(settings) }}
        >
          <div
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              width: `${100 / PREVIEW_SCALE}%`,
              height: `${100 / PREVIEW_SCALE}%`,
            }}
          >
            <NSHero {...draft} slides={slides} />
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-card border border-border bg-surface p-5">
      <NSLabel>Fotos y videos de la portada (máximo {MAX_HERO_SLIDES})</NSLabel>
      <p className="mt-1 text-xs text-muted-foreground">
        Esto es lo que se ve de fondo en la portada. Con una sola foto o video, se queda fija; con varias, la
        portada las va mostrando una tras otra en la tienda. El título, subtítulo y botón de arriba (y su
        posición en la vista previa) se mantienen fijos — esto solo cambia el fondo.
      </p>
      <div className="mt-4">
        <NSHeroSlideUploadForm
          tenantId={tenantId}
          tenantSlug={tenantSlug}
          atCap={slides.length >= MAX_HERO_SLIDES}
          maxSlides={MAX_HERO_SLIDES}
        />
      </div>
      <div className="mt-4">
        <NSHeroSlideList tenantId={tenantId} tenantSlug={tenantSlug} slides={slides} />
      </div>
    </div>
    </div>
  );
}
