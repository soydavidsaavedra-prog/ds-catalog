"use client";

import { useState } from "react";
import { MAX_HERO_SLIDES, type HeroSlide, type SiteSettings } from "@/lib/types/catalog";
import type { ThemeKey } from "@/lib/types/tenant";
import { NSLabel } from "@/components/ui/NSInput";
import { NSHero } from "@/components/storefront/themes/theme-01/NSHero";
import { Hero as Theme02Hero } from "@/components/storefront/themes/theme-02/Hero";
import { NSHeroSlideUploadForm } from "@/components/admin/NSHeroSlideUploadForm";
import { NSHeroSlideList } from "@/components/admin/NSHeroSlideList";
import { NSTenantPreviewFrame } from "@/components/admin/design-studio/NSTenantPreviewFrame";
import { NSHeroFieldsEditor, type HeroDraft } from "@/components/admin/design-studio/NSHeroFieldsEditor";

export function NSHeroEditorForm({
  tenantId,
  tenantSlug,
  theme,
  settings,
  slides,
}: {
  tenantId: string;
  tenantSlug: string;
  /** Which Theme actually renders this tenant's storefront — the preview below must match it, not always show Theme 01. */
  theme: ThemeKey;
  settings: SiteSettings;
  /** Photos/videos that auto-rotate behind the static text below — see /admin/inicio's "Portada (Hero)" section. Empty means the storefront shows just the single image above, unchanged. */
  slides: HeroSlide[];
}) {
  const [draft, setDraft] = useState<HeroDraft>({
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="w-full xl:max-w-md">
          <NSHeroFieldsEditor tenantId={tenantId} tenantSlug={tenantSlug} draft={draft} setDraft={setDraft} />
        </div>

        <div className="w-full xl:flex-1">
          <NSLabel>Vista previa en vivo</NSLabel>
          <NSTenantPreviewFrame theme={theme} settings={settings} mode="compact" naturalHeight={640} scale={0.32}>
            {theme === "theme-02" ? (
              <Theme02Hero
                eyebrow={draft.eyebrow}
                titleLine1={draft.titleLine1}
                titleLine2={draft.titleLine2}
                subtitle={draft.subtitle}
                ctaLabel={draft.ctaLabel}
                ctaHref={draft.ctaHref}
                image={slides[0]?.mediaUrl ?? draft.image}
                imagePositionX={slides[0]?.positionX ?? draft.imagePositionX}
                imagePositionY={slides[0]?.positionY ?? draft.imagePositionY}
                brandName={settings.brandName}
              />
            ) : (
              <NSHero {...draft} slides={slides} brandName={settings.brandName} />
            )}
          </NSTenantPreviewFrame>
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
