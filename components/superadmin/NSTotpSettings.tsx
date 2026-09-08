"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  confirmTotpEnrollmentAction,
  disableTotpAction,
  startTotpEnrollmentAction,
  type SeguridadActionState,
} from "@/app/superadmin/(shell)/seguridad/actions";
import type { AuthSession, TotpEnrollment } from "@/lib/auth/supabase-auth";
import { DSCard } from "@/components/ui/DSCard";
import { NSButton } from "@/components/ui/NSButton";
import { NSInput, NSLabel } from "@/components/ui/NSInput";

const emptyState: SeguridadActionState = {};

type Mode = "idle" | "enabling" | "disabling";

/**
 * Super-Admin-only 2FA settings — see app/superadmin/(shell)/seguridad/actions.ts
 * for why every step re-confirms the password (GoTrue's MFA API has no
 * admin-side shortcut). `enabled` comes from the server on first load;
 * revalidatePath in the actions refreshes it automatically once a
 * confirm/disable succeeds, so switching this component back to "idle"
 * after that (see onDone below) already reflects the new state.
 */
export function NSTotpSettings({ enabled }: { enabled: boolean }) {
  const [mode, setMode] = useState<Mode>("idle");

  if (mode === "enabling") {
    return <NSTotpEnableFlow onCancel={() => setMode("idle")} onDone={() => setMode("idle")} />;
  }

  if (mode === "disabling") {
    return <NSTotpDisableFlow onCancel={() => setMode("idle")} onDone={() => setMode("idle")} />;
  }

  return (
    <DSCard>
      <p className="text-sm font-medium text-foreground">
        Verificación en dos pasos:{" "}
        <span className={enabled ? "text-success" : "text-muted-foreground"}>{enabled ? "Activada" : "Desactivada"}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {enabled
          ? "Cada inicio de sesión pide, además de tu contraseña, un código de tu app autenticadora."
          : "Agrega una capa extra de seguridad — sin esto, quien adivine o filtre tu contraseña entra directo."}
      </p>
      <NSButton
        variant={enabled ? "outline" : "primary"}
        size="sm"
        className="mt-4"
        onClick={() => setMode(enabled ? "disabling" : "enabling")}
      >
        {enabled ? "Desactivar" : "Activar"}
      </NSButton>
    </DSCard>
  );
}

function NSTotpDisableFlow({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(disableTotpAction, emptyState);

  if (state.success) {
    return (
      <DSCard>
        <p className="text-sm text-success">{state.success}</p>
        <NSButton variant="outline" size="sm" className="mt-4" onClick={onDone}>
          Listo
        </NSButton>
      </DSCard>
    );
  }

  return (
    <DSCard>
      <p className="text-sm font-medium text-foreground">Confirma tu contraseña para desactivar</p>
      <form action={formAction} className="mt-4 flex flex-col gap-4">
        {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        <div>
          <NSLabel htmlFor="disable-password">Contraseña</NSLabel>
          <NSInput id="disable-password" name="password" type="password" required autoComplete="current-password" autoFocus />
        </div>
        <div className="flex gap-2">
          <NSButton type="submit" loading={pending}>
            Confirmar
          </NSButton>
          <NSButton type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </NSButton>
        </div>
      </form>
    </DSCard>
  );
}

function NSTotpEnableFlow({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(startTotpEnrollmentAction, emptyState);

  if (state.enrollment) {
    return <NSTotpConfirmStep enrollment={state.enrollment} onCancel={onCancel} onDone={onDone} />;
  }

  return (
    <DSCard>
      <p className="text-sm font-medium text-foreground">Confirma tu contraseña para activar</p>
      <form action={formAction} className="mt-4 flex flex-col gap-4">
        {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        <div>
          <NSLabel htmlFor="enable-password">Contraseña</NSLabel>
          <NSInput id="enable-password" name="password" type="password" required autoComplete="current-password" autoFocus />
        </div>
        <div className="flex gap-2">
          <NSButton type="submit" loading={pending}>
            Continuar
          </NSButton>
          <NSButton type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </NSButton>
        </div>
      </form>
    </DSCard>
  );
}

function NSTotpConfirmStep({
  enrollment,
  onCancel,
  onDone,
}: {
  enrollment: TotpEnrollment & { session: AuthSession };
  onCancel: () => void;
  onDone: () => void;
}) {
  const confirmAction = confirmTotpEnrollmentAction.bind(null, enrollment.session, enrollment.factorId);
  const [state, formAction, pending] = useActionState(confirmAction, emptyState);

  if (state.success) {
    return (
      <DSCard>
        <p className="text-sm text-success">{state.success}</p>
        <NSButton variant="outline" size="sm" className="mt-4" onClick={onDone}>
          Listo
        </NSButton>
      </DSCard>
    );
  }

  return (
    <DSCard>
      <p className="text-sm font-medium text-foreground">Escanea el código con tu app autenticadora</p>
      <div className="mt-4 flex justify-center rounded-control border border-border bg-white p-4">
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(enrollment.qrCodeSvg)}`}
          alt="Código QR para configurar la app autenticadora"
          width={176}
          height={176}
          unoptimized
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">¿No puedes escanear? Ingresa este código manualmente:</p>
      <p className="mt-1 select-all break-all text-center font-mono text-sm">{enrollment.secret}</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        <div>
          <NSLabel htmlFor="confirm-code">Código de 6 dígitos</NSLabel>
          <NSInput
            id="confirm-code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            autoComplete="one-time-code"
          />
        </div>
        <div className="flex gap-2">
          <NSButton type="submit" loading={pending}>
            Confirmar
          </NSButton>
          <NSButton type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </NSButton>
        </div>
      </form>
    </DSCard>
  );
}
