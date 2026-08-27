"use client";

import { useActionState, useState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import { updateStatementSettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";
import { NSBrandStatement } from "@/components/storefront/themes/theme-01/NSBrandStatement";

const initialState: ActionState = {};
const PREVIEW_SCALE = 0.4;

export function NSStatementEditorForm({ tenantId, tenantSlug, settings }: { tenantId: string; tenantSlug: string; settings: SiteSettings }) {
  const boundAction = updateStatementSettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const [draft, setDraft] = useState({
    titleLine1: settings.statementTitleLine1,
    titleLine2: settings.statementTitleLine2,
    description: settings.statementDescription,
    image: settings.statementImage,
  });

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <NSLabel htmlFor="statementTitleLine1">Título — línea 1</NSLabel>
            <NSInput
              id="statementTitleLine1"
              name="statementTitleLine1"
              value={draft.titleLine1}
              onChange={(e) => set("titleLine1", e.target.value)}
            />
          </div>
          <div>
            <NSLabel htmlFor="statementTitleLine2">Título — línea 2 (dorada)</NSLabel>
            <NSInput
              id="statementTitleLine2"
              name="statementTitleLine2"
              value={draft.titleLine2}
              onChange={(e) => set("titleLine2", e.target.value)}
            />
          </div>
        </div>
        <div>
          <NSLabel htmlFor="statementDescription">Descripción</NSLabel>
          <NSTextarea
            id="statementDescription"
            name="statementDescription"
            rows={3}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="border-t border-border pt-5">
          <NSLabel>Foto</NSLabel>
          <NSSingleImageUploader
            tenantSlug={tenantSlug}
            name="statementImage"
            initialValue={draft.image}
            label="Subir foto"
            onChange={(url) => set("image", url)}
          />
        </div>

        <NSButton type="submit" loading={pending} className="self-start">
          Guardar sección
        </NSButton>
      </form>

      <div className="w-full xl:flex-1">
        <NSLabel>Vista previa en vivo</NSLabel>
        <div className="overflow-hidden rounded-card border border-border" style={{ height: 420 * PREVIEW_SCALE }}>
          <div
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              width: `${100 / PREVIEW_SCALE}%`,
              height: `${100 / PREVIEW_SCALE}%`,
            }}
          >
            <NSBrandStatement
              titleLine1={draft.titleLine1}
              titleLine2={draft.titleLine2}
              description={draft.description}
              image={draft.image}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
