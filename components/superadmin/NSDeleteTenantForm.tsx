"use client";

import { useActionState, useState } from "react";
import { deleteTenantAction, type SuperadminActionState } from "@/app/superadmin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: SuperadminActionState = {};

export function NSDeleteTenantForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [state, formAction, pending] = useActionState(deleteTenantAction.bind(null, tenantId), initialState);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <NSButton type="button" variant="outline" size="sm" onClick={() => setExpanded(true)}>
        Eliminar cliente
      </NSButton>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-3">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Esta acción borra el catálogo completo y todos los archivos de Storage de <strong>{tenantSlug}</strong> de
        forma permanente. No se puede deshacer.
      </p>
      <div>
        <NSLabel htmlFor="confirmSlug">
          Escribe <code>{tenantSlug}</code> para confirmar
        </NSLabel>
        <NSInput
          id="confirmSlug"
          name="confirmSlug"
          value={confirmSlug}
          onChange={(e) => setConfirmSlug(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="flex gap-2">
        <NSButton
          type="submit"
          variant="secondary"
          loading={pending}
          disabled={confirmSlug !== tenantSlug}
          className="self-start bg-danger text-white hover:bg-danger/90"
        >
          Eliminar permanentemente
        </NSButton>
        <NSButton type="button" variant="outline" onClick={() => setExpanded(false)}>
          Cancelar
        </NSButton>
      </div>
    </form>
  );
}
