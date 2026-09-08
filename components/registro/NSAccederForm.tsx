"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accederAction,
  verifyTotpLoginAction,
  type AccederActionState,
  type TotpChallenge,
} from "@/app/acceder/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: AccederActionState = {};

export function NSAccederForm() {
  const [state, formAction, pending] = useActionState(accederAction, initialState);

  if (state.totpChallenge) {
    return <NSTotpLoginForm challenge={state.totpChallenge} />;
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

      <div>
        <div className="flex items-center justify-between">
          <NSLabel htmlFor="password">Contraseña</NSLabel>
          <Link href="/acceder/recuperar" className="text-xs font-medium text-accent-strong hover:underline">
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

/** Step 2 — only ever reached for a Super Admin with 2FA activada (/superadmin/seguridad). `challenge` is fixed for this component's lifetime; a wrong code just re-renders this same screen with its own error, never falling back to step 1 on its own. */
function NSTotpLoginForm({ challenge }: { challenge: TotpChallenge }) {
  const verifyAction = verifyTotpLoginAction.bind(null, challenge);
  const [state, formAction, pending] = useActionState(verifyAction, {} as AccederActionState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div>
        <NSLabel htmlFor="code">Código de verificación</NSLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Abre tu app autenticadora (Google Authenticator, Authy, etc.) e ingresa el código de 6 dígitos.
        </p>
        <NSInput
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus
          autoComplete="one-time-code"
          required
        />
      </div>

      <NSButton type="submit" loading={pending} className="w-full">
        Verificar
      </NSButton>

      <Link href="/acceder" className="text-center text-xs font-medium text-muted-foreground hover:underline">
        Usar otra cuenta
      </Link>
    </form>
  );
}
