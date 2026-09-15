"use client";

import { useActionState, type Dispatch, type SetStateAction } from "react";
import { updateHeroSettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: ActionState = {};

export interface HeroDraft {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imagePositionX: number;
  imagePositionY: number;
}

/**
 * The editable-fields half of "Portada (Hero)" — split out of
 * NSHeroEditorForm so it can be reused both by the standalone
 * /admin/inicio page (next to its own big preview) and by the Design
 * Studio's properties panel (next to the Studio's full-page canvas,
 * which is the preview there). Owns its own form/Server Action/submit
 * button either way — the two hosts differ only in what they render
 * alongside this, not in how saving works.
 */
export function NSHeroFieldsEditor({
  tenantId,
  tenantSlug,
  draft,
  setDraft,
}: {
  tenantId: string;
  tenantSlug: string;
  draft: HeroDraft;
  setDraft: Dispatch<SetStateAction<HeroDraft>>;
}) {
  const boundAction = updateHeroSettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  function set<K extends keyof HeroDraft>(key: K, value: HeroDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      {state.success ? (
        <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
          Portada guardada.
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      {/* No manual image upload/position control here anymore — Fotos y
          videos (below, in the standalone editor) is now the one place
          that manages what's behind the portada. These hidden fields
          just carry the tenant's existing background through "Guardar
          portada" unchanged, so saving the text fields never blanks it out. */}
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
  );
}
