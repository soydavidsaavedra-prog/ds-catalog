"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type RecuperarActionState } from "@/app/acceder/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: RecuperarActionState = {};

export function NSRecuperarForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-ink-300">
        Si ese correo tiene una cuenta, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de
        entrada (y spam).
      </p>
    );
  }

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

      <NSButton type="submit" loading={pending} className="w-full">
        Enviar enlace de recuperación
      </NSButton>
    </form>
  );
}
