"use client";

import { useRef, useState } from "react";
import { connectWhatsAppAccountAction } from "@/app/[tenant]/admin/(shell)/redes-sociales/actions";
import { NSLabel, NSInput } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

/**
 * WhatsApp connects by pasting credentials rather than an OAuth button —
 * see lib/social/whatsapp.ts's doc comment for why. Both values come from
 * Meta's dashboard: the Phone Number ID from the WhatsApp use case's
 * "Configuración de la API", the access token from a System User in
 * Meta Business Suite (or the temporary token shown there, valid ~24h,
 * for quick testing).
 */
export function NSConnectWhatsAppForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setPending(true);
        setError(null);
        const result = await connectWhatsAppAccountAction(tenantId, tenantSlug, formData);
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <NSLabel htmlFor="wa-phone-id">ID de número de teléfono</NSLabel>
        <NSInput id="wa-phone-id" name="phoneNumberId" required placeholder="123456789012345" />
      </div>
      <div>
        <NSLabel htmlFor="wa-token">Token de acceso</NSLabel>
        <NSInput id="wa-token" name="accessToken" required type="password" placeholder="EAAG..." />
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-danger">{error}</p> : null}
      <div className="flex items-end sm:col-span-2">
        <NSButton type="submit" size="sm" loading={pending}>
          Conectar número de WhatsApp
        </NSButton>
      </div>
    </form>
  );
}
