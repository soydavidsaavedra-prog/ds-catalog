"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  confirmTotpEnrollmentAction,
  disableTotpAction,
  regenerateBackupCodesAction,
  startTotpEnrollmentAction,
  type SeguridadActionState,
} from "@/app/superadmin/(shell)/seguridad/actions";
import type { AuthSession, TotpEnrollment } from "@/lib/auth/supabase-auth";
import { DSCard } from "@/components/ui/DSCard";
import { NSButton } from "@/components/ui/NSButton";
import { NSInput, NSLabel } from "@/components/ui/NSInput";

const emptyState: SeguridadActionState = {};

type Mode = "idle" | "enabling" | "disabling" | "regenerating";

/**
 * Super-Admin-only 2FA settings — see app/superadmin/(shell)/seguridad/actions.ts
 * for why every step re-confirms the password (GoTrue's MFA API has no
 * admin-side shortcut). `enabled`/`unusedBackupCodes` come from the
 * server on first load; revalidatePath in the actions refreshes them
 * automatically once a confirm/disable/regenerate succeeds, so switching
 * this component back to "idle" after that (see onDone below) already
 * reflects the new state.
 */
export function NSTotpSettings({ enabled, unusedBackupCodes }: { enabled: boolean; unusedBackupCodes: number }) {
  const [mode, setMode] = useState<Mode>("idle");

  if (mode === "enabling") {
    return <NSTotpEnableFlow onCancel={() => setMode("idle")} onDone={() => setMode("idle")} />;
  }

  if (mode === "disabling") {
    return <NSTotpDisableFlow onCancel={() => setMode("idle")} onDone={() => setMode("idle")} />;
  }

  if (mode === "regenerating") {
    return <NSRegenerateBackupCodesFlow onCancel={() => setMode("idle")} onDone={() => setMode("idle")} />;
  }

  return (
    <div className="flex flex-col gap-5">
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

      {enabled ? (
        <DSCard>
          <p className="text-sm font-medium text-foreground">Códigos de respaldo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Te quedan <span className="font-semibold text-foreground">{unusedBackupCodes}</span> de 10 — cada uno funciona
            una sola vez si pierdes el acceso a tu app autenticadora. Regenerar invalida los que no hayas usado.
          </p>
          <NSButton variant="outline" size="sm" className="mt-4" onClick={() => setMode("regenerating")}>
            Regenerar códigos
          </NSButton>
        </DSCard>
      ) : null}
    </div>
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

function NSRegenerateBackupCodesFlow({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(regenerateBackupCodesAction, emptyState);

  if (state.backupCodes) {
    return <NSBackupCodesReveal codes={state.backupCodes} onDone={onDone} />;
  }

  return (
    <DSCard>
      <p className="text-sm font-medium text-foreground">Confirma tu contraseña para regenerar tus códigos</p>
      <p className="mt-1 text-xs text-muted-foreground">Los códigos que no hayas usado dejarán de funcionar.</p>
      <form action={formAction} className="mt-4 flex flex-col gap-4">
        {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        <div>
          <NSLabel htmlFor="regen-password">Contraseña</NSLabel>
          <NSInput id="regen-password" name="password" type="password" required autoComplete="current-password" autoFocus />
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

  if (state.backupCodes) {
    return <NSBackupCodesReveal codes={state.backupCodes} onDone={onDone} />;
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

/** One-time plaintext reveal, shared by first activation and regeneration alike — see totp-backup-codes.ts: this is the only moment these ever exist unhashed, so there's no "show them again later" option anywhere in this UI. */
function NSBackupCodesReveal({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  return (
    <DSCard>
      <p className="text-sm font-medium text-foreground">Guarda tus códigos de respaldo</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Cada uno funciona una sola vez si pierdes el acceso a tu app autenticadora. Esta es la única vez que se muestran —
        guárdalos en un lugar seguro (un gestor de contraseñas, no una nota sin cifrar).
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-control border border-border bg-surface p-4 font-mono text-sm">
        {codes.map((code) => (
          <span key={code} className="select-all">
            {code}
          </span>
        ))}
      </div>
      <NSButton variant="outline" size="sm" className="mt-4" onClick={onDone}>
        Ya los guardé
      </NSButton>
    </DSCard>
  );
}
