"use client";

import Link from "next/link";
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
        <NSLabel htmlFor="email">Correo</NSLabel>
        <NSInput id="email" name="email" type="email" required autoFocus autoComplete="username" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <NSLabel htmlFor="password">Contraseña</NSLabel>
          <Link href="/acceder/recuperar" className="text-xs font-medium text-accent hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <NSInput id="password" name="password" type="password" required autoComplete="current-password" />
      </div>

      <NSButton type="submit" loading={pending} className="w-full">
        Ingresar
      </NSButton>
    </form>
  );
}
