"use client";

import { useActionState } from "react";
import { changeAccountPasswordAction, type AccountActionState } from "@/app/[tenant]/admin/cuenta/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: AccountActionState = {};

export function NSAccountPasswordForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const boundAction = changeAccountPasswordAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <section>
      <h2 className="font-display text-lg uppercase tracking-wide">Contraseña</h2>
      <form action={formAction} className="mt-4 flex max-w-md flex-col gap-4">
        {state.error ? (
          <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div>
        ) : null}
        {state.success ? (
          <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
            Contraseña actualizada.
          </div>
        ) : null}
        <div>
          <NSLabel htmlFor="currentPassword">Contraseña actual</NSLabel>
          <NSInput id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
        </div>
        <div>
          <NSLabel htmlFor="newPassword">Nueva contraseña</NSLabel>
          <NSInput id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <NSLabel htmlFor="confirmPassword">Confirmar contraseña</NSLabel>
          <NSInput id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <NSButton type="submit" loading={pending} size="sm" className="self-start">
          Cambiar contraseña
        </NSButton>
      </form>
    </section>
  );
}
