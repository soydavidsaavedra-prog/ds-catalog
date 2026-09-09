"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  accederAction,
  verifyBackupCodeLoginAction,
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

/** Step 2 — only ever reached for a Super Admin with 2FA activada (/superadmin/seguridad). `challenge` is fixed for this component's lifetime; a wrong code just re-renders this same screen with its own error, never falling back to step 1 on its own. Toggles between the TOTP form and the backup-code form locally — both post to a different Server Action bound to the same challenge. */
function NSTotpLoginForm({ challenge }: { challenge: TotpChallenge }) {
  const [useBackupCode, setUseBackupCode] = useState(false);

  if (useBackupCode) {
    return <NSBackupCodeLoginForm challenge={challenge} onBack={() => setUseBackupCode(false)} />;
  }

  return <NSTotpCodeLoginForm challenge={challenge} onUseBackupCode={() => setUseBackupCode(true)} />;
}

function NSTotpCodeLoginForm({ challenge, onUseBackupCode }: { challenge: TotpChallenge; onUseBackupCode: () => void }) {
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

      <button
        type="button"
        onClick={onUseBackupCode}
        className="text-center text-xs font-medium text-accent-strong hover:underline"
      >
        ¿Perdiste el acceso a tu app? Usar un código de respaldo
      </button>

      <Link href="/acceder" className="text-center text-xs font-medium text-muted-foreground hover:underline">
        Usar otra cuenta
      </Link>
    </form>
  );
}

function NSBackupCodeLoginForm({ challenge, onBack }: { challenge: TotpChallenge; onBack: () => void }) {
  const verifyAction = verifyBackupCodeLoginAction.bind(null, challenge);
  const [state, formAction, pending] = useActionState(verifyAction, {} as AccederActionState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div>
        <NSLabel htmlFor="backupCode">Código de respaldo</NSLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Uno de los 10 códigos que guardaste al activar la verificación en dos pasos. Cada uno funciona una sola vez.
        </p>
        <NSInput id="backupCode" name="backupCode" type="text" autoFocus autoComplete="off" required />
      </div>

      <NSButton type="submit" loading={pending} className="w-full">
        Verificar
      </NSButton>

      <button type="button" onClick={onBack} className="text-center text-xs font-medium text-muted-foreground hover:underline">
        Volver al código de la app
      </button>
    </form>
  );
}
