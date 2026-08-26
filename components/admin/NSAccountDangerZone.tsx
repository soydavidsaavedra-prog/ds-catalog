"use client";

import { useState } from "react";
import {
  requestAccountDeletionAction,
  cancelAccountDeletionRequestAction,
} from "@/app/[tenant]/admin/cuenta/actions";
import { NSButton } from "@/components/ui/NSButton";

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
    <section className="rounded-card border border-danger/30 p-5">
      <h2 className="font-display text-lg uppercase tracking-wide text-danger">Zona de peligro</h2>

      {deletionRequestedAt ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
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
          <p className="mt-1 text-sm text-muted-foreground">
            Envía una solicitud para eliminar tu cuenta y tu catálogo permanentemente.
          </p>
          <NSButton type="button" variant="outline" size="sm" className="mt-4" onClick={() => setConfirming(true)}>
            Solicitar eliminación de cuenta
          </NSButton>
        </>
      )}
    </section>
  );
}
