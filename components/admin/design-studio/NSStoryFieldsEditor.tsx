"use client";

import { useActionState, type Dispatch, type SetStateAction } from "react";
import { updateStorySettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";
import { DEFAULT_STEP_LABELS } from "@/components/storefront/themes/theme-01/NSFactoryStory";

const initialState: ActionState = {};

type StepTuple = [string, string, string, string, string];

export interface StoryDraft {
  eyebrow: string;
  title: string;
  description: string;
  stepImages: StepTuple;
  stepLabels: StepTuple;
}

/** The editable-fields half of "Historia de fábrica" (theme-01 only) — see NSHeroFieldsEditor for why this is split from NSStoryEditorForm. */
export function NSStoryFieldsEditor({
  tenantId,
  tenantSlug,
  draft,
  setDraft,
}: {
  tenantId: string;
  tenantSlug: string;
  draft: StoryDraft;
  setDraft: Dispatch<SetStateAction<StoryDraft>>;
}) {
  const boundAction = updateStorySettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  function set<K extends keyof StoryDraft>(key: K, value: StoryDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function setStepImage(index: number, url: string) {
    setDraft((prev) => {
      const next = [...prev.stepImages] as StepTuple;
      next[index] = url;
      return { ...prev, stepImages: next };
    });
  }

  function setStepLabel(index: number, label: string) {
    setDraft((prev) => {
      const next = [...prev.stepLabels] as StepTuple;
      next[index] = label;
      return { ...prev, stepLabels: next };
    });
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
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
        <NSInput id="storyTitle" name="storyTitle" value={draft.title} onChange={(e) => set("title", e.target.value)} />
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
        <NSLabel>Pasos del proceso (5)</NSLabel>
        <p className="-mt-2.5 text-xs text-muted-foreground">
          El nombre de cada paso es editable — cámbialo si tu catálogo no es de ropa (ej. &quot;Horneado&quot;,
          &quot;Empaque&quot;, &quot;Entrega&quot;).
        </p>
        {draft.stepLabels.map((label, index) => (
          <div key={index} className="flex flex-col gap-2 border-b border-border pb-4 last:border-0 last:pb-0">
            <NSInput
              name={`storyStepLabel${index + 1}`}
              value={label}
              onChange={(e) => setStepLabel(index, e.target.value)}
              placeholder={DEFAULT_STEP_LABELS[index]}
            />
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
  );
}
