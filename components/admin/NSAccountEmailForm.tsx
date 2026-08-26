"use client";

import { useActionState } from "react";
import { changeAccountEmailAction, type AccountActionState } from "@/app/[tenant]/admin/cuenta/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: AccountActionState = {};

export function NSAccountEmailForm({
  tenantId,
  tenantSlug,
  currentEmail,
}: {
  tenantId: string;
  tenantSlug: string;
  currentEmail: string;
}) {
  const boundAction = changeAccountEmailAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <section>
      <h2 className="font-display text-lg uppercase tracking-wide">Correo de inicio de sesión</h2>
      <p className="mt-1 text-sm text-muted-foreground">Actual: {currentEmail}</p>
      <form action={formAction} className="mt-4 flex max-w-md flex-col gap-4">
        {state.error ? (
          <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div>
        ) : null}
        {state.success ? (
          <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
            Correo actualizado.
          </div>
        ) : null}
        <div>
          <NSLabel htmlFor="email">Nuevo correo</NSLabel>
          <NSInput id="email" name="email" type="email" required autoComplete="off" />
        </div>
        <div>
          <NSLabel htmlFor="currentPassword">Tu contraseña actual</NSLabel>
          <NSInput id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
        </div>
        <NSButton type="submit" loading={pending} size="sm" className="self-start">
          Cambiar correo
        </NSButton>
      </form>
    </section>
  );
}
