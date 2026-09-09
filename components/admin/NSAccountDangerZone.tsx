"use client";

import { useState } from "react";
import {
  requestAccountDeletionAction,
  cancelAccountDeletionRequestAction,
} from "@/app/[tenant]/admin/cuenta/actions";
import { NSButton } from "@/components/ui/NSButton";
import { DSCard } from "@/components/ui/DSCard";

export function NSAccountDangerZone({
  tenantId,
  tenantSlug,
  deletionRequestedAt,
}: {
  tenantId: string;
  tenantSlug: string;
  deletionRequestedAt: string | null;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <DSCard className="border-danger/25">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-danger/10 text-danger">
          <WarningIcon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-danger">Zona de peligro</h2>
          <p className="text-xs text-muted-foreground">Estas acciones pueden afectar permanentemente tu cuenta y catálogo.</p>
        </div>
      </div>

      {deletionRequestedAt ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Pediste eliminar tu cuenta el {new Date(deletionRequestedAt).toLocaleDateString("es")}. Nos pondremos en
            contacto contigo antes de proceder.
          </p>
          <form action={cancelAccountDeletionRequestAction.bind(null, tenantId, tenantSlug)} className="mt-4">
            <NSButton type="submit" variant="outline" size="sm">
              Cancelar solicitud
            </NSButton>
          </form>
        </>
      ) : confirming ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Enviaremos tu solicitud a la plataforma. Te contactaremos antes de borrar nada — tu catálogo sigue activo
            mientras tanto.
          </p>
          <div className="flex gap-2">
            <form action={requestAccountDeletionAction.bind(null, tenantId, tenantSlug)}>
              <NSButton
                type="submit"
                variant="secondary"
                size="sm"
                className="bg-danger text-white hover:bg-danger/90"
              >
                Sí, solicitar eliminación
              </NSButton>
            </form>
            <NSButton type="button" variant="outline" size="sm" onClick={() => setConfirming(false)}>
              Cancelar
            </NSButton>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Envía una solicitud para eliminar tu cuenta y tu catálogo permanentemente.
          </p>
          <NSButton type="button" variant="outline" size="sm" className="mt-4" onClick={() => setConfirming(true)}>
            Solicitar eliminación de cuenta
          </NSButton>
        </>
      )}
    </DSCard>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 3 2.5 16h15L10 3Z" />
      <path d="M10 8.5v3.5" />
      <circle cx="10" cy="14.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
