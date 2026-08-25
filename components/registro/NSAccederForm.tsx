"use client";

import { useActionState } from "react";
import { accederAction, type AccederActionState } from "@/app/acceder/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: AccederActionState = {};

export function NSAccederForm() {
  const [state, formAction, pending] = useActionState(accederAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div>
        <NSLabel htmlFor="slug">Enlace de tu catálogo</NSLabel>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="shrink-0">ds-catalog.app/</span>
          <NSInput id="slug" name="slug" required autoFocus placeholder="tu-negocio" className="flex-1" />
        </div>
      </div>

      <div>
        <NSLabel htmlFor="password">Contraseña</NSLabel>
        <NSInput id="password" name="password" type="password" required />
      </div>

      <NSButton type="submit" loading={pending} className="w-full">
        Ingresar
      </NSButton>
    </form>
  );
}
