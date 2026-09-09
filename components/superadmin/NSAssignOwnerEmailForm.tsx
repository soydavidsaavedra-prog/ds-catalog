"use client";

import { useActionState, useState } from "react";
import { assignTenantOwnerEmailAction, type SuperadminActionState } from "@/app/superadmin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: SuperadminActionState = {};

export function NSAssignOwnerEmailForm({ tenantId, currentEmail }: { tenantId: string; currentEmail?: string }) {
  const boundAction = assignTenantOwnerEmailAction.bind(null, tenantId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [open, setOpen] = useState(!currentEmail);

  if (!open) {
    return (
      <NSButton type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Reasignar correo
      </NSButton>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state.error ? (
        <div className="w-full rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}
      <div>
        <NSLabel htmlFor="email">{currentEmail ? "Nuevo correo" : "Correo del administrador"}</NSLabel>
        <NSInput id="email" name="email" type="email" required autoFocus className="w-64" />
      </div>
      <NSButton type="submit" loading={pending} size="sm">
        {currentEmail ? "Reasignar e invitar" : "Invitar por correo"}
      </NSButton>
    </form>
  );
}
