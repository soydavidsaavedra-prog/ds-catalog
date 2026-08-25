"use client";

import { useActionState } from "react";
import { superadminLoginAction, type SuperadminActionState } from "@/app/superadmin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: SuperadminActionState = {};

export function NSSuperAdminLoginForm() {
  const [state, formAction, pending] = useActionState(superadminLoginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}
      <div>
        <NSLabel htmlFor="email">Correo</NSLabel>
        <NSInput id="email" name="email" type="email" required autoFocus autoComplete="username" />
      </div>
      <div>
        <NSLabel htmlFor="password">Contraseña</NSLabel>
        <NSInput id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <NSButton type="submit" loading={pending} className="w-full">
        Ingresar
      </NSButton>
    </form>
  );
}
