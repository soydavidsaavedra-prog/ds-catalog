"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: ActionState = {};

export function NSLoginForm({ tenantSlug }: { tenantSlug: string }) {
  const boundAction = loginAction.bind(null, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}
      <div>
        <NSLabel htmlFor="password">Contraseña</NSLabel>
        <NSInput id="password" name="password" type="password" required autoFocus />
      </div>
      <NSButton type="submit" loading={pending} className="w-full">
        Ingresar
      </NSButton>
    </form>
  );
}
