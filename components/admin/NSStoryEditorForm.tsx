"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import type { ThemeKey } from "@/lib/types/tenant";
import { NSLabel } from "@/components/ui/NSInput";
import { NSFactoryStory, DEFAULT_STEP_LABELS } from "@/components/storefront/themes/theme-01/NSFactoryStory";
import { NSTenantPreviewFrame } from "@/components/admin/design-studio/NSTenantPreviewFrame";
import { NSStoryFieldsEditor, type StoryDraft } from "@/components/admin/design-studio/NSStoryFieldsEditor";

export function NSStoryEditorForm({
  tenantId,
  tenantSlug,
  theme,
  settings,
}: {
  tenantId: string;
  tenantSlug: string;
  /** Theme 02 has no equivalent to this "proceso" section at all — its real storefront never renders these fields, so the preview says so instead of showing Theme 01's rendering as if it applied. */
  theme: ThemeKey;
  settings: SiteSettings;
}) {
  const [draft, setDraft] = useState<StoryDraft>({
    eyebrow: settings.storyEyebrow,
    title: settings.storyTitle,
    description: settings.storyDescription,
    stepImages: [
      settings.storyStepImage1,
      settings.storyStepImage2,
      settings.storyStepImage3,
      settings.storyStepImage4,
      settings.storyStepImage5,
    ],
    stepLabels: [
      settings.storyStepLabel1 ?? DEFAULT_STEP_LABELS[0],
      settings.storyStepLabel2 ?? DEFAULT_STEP_LABELS[1],
      settings.storyStepLabel3 ?? DEFAULT_STEP_LABELS[2],
      settings.storyStepLabel4 ?? DEFAULT_STEP_LABELS[3],
      settings.storyStepLabel5 ?? DEFAULT_STEP_LABELS[4],
    ],
  });

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="w-full xl:max-w-md">
        <NSStoryFieldsEditor tenantId={tenantId} tenantSlug={tenantSlug} draft={draft} setDraft={setDraft} />
      </div>

      <div className="w-full xl:flex-1">
        <NSLabel>Vista previa en vivo</NSLabel>
        {theme === "theme-01" ? (
          <NSTenantPreviewFrame theme={theme} settings={settings} mode="compact" naturalHeight={620} scale={0.4}>
            <NSFactoryStory
              eyebrow={draft.eyebrow}
              title={draft.title}
              description={draft.description}
              stepImages={draft.stepImages}
              stepLabels={draft.stepLabels}
              brandName={settings.brandName}
            />
          </NSTenantPreviewFrame>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border px-6 text-center">
            <p className="text-sm font-medium text-foreground">El Theme actual de tu catálogo no muestra esta sección.</p>
            <p className="text-xs text-muted-foreground">Puedes guardar el contenido igual — se usará si más adelante cambias a un Theme que sí la incluya.</p>
          </div>
        )}
      </div>
    </div>
  );
}
