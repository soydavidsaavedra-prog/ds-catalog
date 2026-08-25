"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordActionState } from "@/app/acceder/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: ResetPasswordActionState = {};

/**
 * Supabase's recovery email redirects here with the session tokens in the
 * URL fragment (#access_token=...&type=recovery) — fragments never reach
 * the server on their own, so this has to be a client component that reads
 * window.location.hash itself before it can even render the real form.
 */
export function NSResetPasswordForm() {
  const [accessToken, setAccessToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("access_token");
    const type = params.get("type");
    setAccessToken(token && type === "recovery" ? token : null);
  }, []);

  if (accessToken === undefined) {
    return null;
  }

  if (accessToken === null) {
    return (
      <p className="text-sm text-ink-300">
        Este enlace no es válido o ya expiró.{" "}
        <Link href="/acceder/recuperar" className="font-semibold text-accent hover:underline">
          Solicita uno nuevo
        </Link>
        .
      </p>
    );
  }

  return <NSResetPasswordFormFields accessToken={accessToken} />;
}

function NSResetPasswordFormFields({ accessToken }: { accessToken: string }) {
  const boundAction = resetPasswordAction.bind(null, accessToken);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div>
        <NSLabel htmlFor="password">Nueva contraseña</NSLabel>
        <NSInput id="password" name="password" type="password" required autoFocus minLength={8} />
      </div>

      <div>
        <NSLabel htmlFor="confirmPassword">Confirmar contraseña</NSLabel>
        <NSInput id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
      </div>

      <NSButton type="submit" loading={pending} className="w-full">
        Guardar contraseña
      </NSButton>
    </form>
  );
}
