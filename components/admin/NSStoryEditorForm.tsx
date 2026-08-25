"use client";

import { useActionState, useState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import { updateStorySettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";
import { NSFactoryStory } from "@/components/home/NSFactoryStory";

const initialState: ActionState = {};

const STEP_LABELS = ["Tela", "Corte", "Confección", "Detalle", "Producto"];
const PREVIEW_SCALE = 0.4;

export function NSStoryEditorForm({ tenantId, tenantSlug, settings }: { tenantId: string; tenantSlug: string; settings: SiteSettings }) {
  const boundAction = updateStorySettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const [draft, setDraft] = useState({
    eyebrow: settings.storyEyebrow,
    title: settings.storyTitle,
    description: settings.storyDescription,
    stepImages: [
      settings.storyStepImage1,
      settings.storyStepImage2,
      settings.storyStepImage3,
      settings.storyStepImage4,
      settings.storyStepImage5,
    ] as [string, string, string, string, string],
  });

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function setStepImage(index: number, url: string) {
    setDraft((prev) => {
      const next = [...prev.stepImages] as typeof prev.stepImages;
      next[index] = url;
      return { ...prev, stepImages: next };
    });
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <form action={formAction} className="flex w-full flex-col gap-5 xl:max-w-md">
        {state.success ? (
          <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
            Sección guardada.
          </div>
        ) : null}
        {state.error ? (
          <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
            {state.error}
          </div>
        ) : null}

        <div>
          <NSLabel htmlFor="storyEyebrow">Texto pequeño (arriba del título)</NSLabel>
          <NSInput
            id="storyEyebrow"
            name="storyEyebrow"
            value={draft.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
          />
        </div>
        <div>
          <NSLabel htmlFor="storyTitle">Título</NSLabel>
          <NSInput
            id="storyTitle"
            name="storyTitle"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <NSLabel htmlFor="storyDescription">Descripción</NSLabel>
          <NSTextarea
            id="storyDescription"
            name="storyDescription"
            rows={3}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-5">
          <NSLabel>Fotos del proceso (5)</NSLabel>
          {STEP_LABELS.map((label, index) => (
            <div key={label}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
              <NSSingleImageUploader
                tenantSlug={tenantSlug}
                name={`storyStepImage${index + 1}`}
                initialValue={draft.stepImages[index]}
                label="Subir foto"
                onChange={(url) => setStepImage(index, url)}
              />
            </div>
          ))}
        </div>

        <NSButton type="submit" loading={pending} className="self-start">
          Guardar sección
        </NSButton>
      </form>

      <div className="w-full xl:flex-1">
        <NSLabel>Vista previa en vivo</NSLabel>
        <div className="overflow-hidden rounded-card border border-border" style={{ height: 620 * PREVIEW_SCALE }}>
          <div
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              width: `${100 / PREVIEW_SCALE}%`,
              height: `${100 / PREVIEW_SCALE}%`,
            }}
          >
            <NSFactoryStory
              eyebrow={draft.eyebrow}
              title={draft.title}
              description={draft.description}
              stepImages={draft.stepImages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
