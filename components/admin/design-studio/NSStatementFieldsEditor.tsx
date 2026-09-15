"use client";

import { useActionState, type Dispatch, type SetStateAction } from "react";
import { updateStatementSettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";

const initialState: ActionState = {};

export interface StatementDraft {
  titleLine1: string;
  titleLine2: string;
  description: string;
  image: string;
}

/** The editable-fields half of "Frase destacada" — see NSHeroFieldsEditor for why this is split from NSStatementEditorForm. */
export function NSStatementFieldsEditor({
  tenantId,
  tenantSlug,
  draft,
  setDraft,
}: {
  tenantId: string;
  tenantSlug: string;
  draft: StatementDraft;
  setDraft: Dispatch<SetStateAction<StatementDraft>>;
}) {
  const boundAction = updateStatementSettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  function set<K extends keyof StatementDraft>(key: K, value: StatementDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
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
  );
}
