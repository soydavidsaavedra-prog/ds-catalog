"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import { updateSettingsAction, type ActionState } from "@/app/admin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";

const initialState: ActionState = {};

export function NSSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.success ? (
        <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
          Configuración guardada.
        </div>
      ) : null}

      <div>
        <NSLabel htmlFor="brandName">Nombre de marca</NSLabel>
        <NSInput id="brandName" name="brandName" defaultValue={settings.brandName} required />
      </div>
      <div>
        <NSLabel htmlFor="slogan">Slogan</NSLabel>
        <NSInput id="slogan" name="slogan" defaultValue={settings.slogan} />
      </div>
      <div>
        <NSLabel htmlFor="whatsappNumber">Número de WhatsApp (con código de país, solo dígitos)</NSLabel>
        <NSInput id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber} placeholder="584121234567" required />
      </div>
      <div>
        <NSLabel htmlFor="currency">Moneda</NSLabel>
        <NSInput id="currency" name="currency" defaultValue={settings.currency} />
      </div>
      <div>
        <NSLabel htmlFor="instagram">Instagram (URL)</NSLabel>
        <NSInput id="instagram" name="instagram" defaultValue={settings.instagram} />
      </div>
      <div>
        <NSLabel htmlFor="facebook">Facebook (URL)</NSLabel>
        <NSInput id="facebook" name="facebook" defaultValue={settings.facebook} />
      </div>
      <div>
        <NSLabel htmlFor="tiktok">TikTok (URL)</NSLabel>
        <NSInput id="tiktok" name="tiktok" defaultValue={settings.tiktok} />
      </div>

      <div className="border-t border-border pt-5">
        <NSLabel>Logo de marca</NSLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Reemplaza el logo recreado en el header, footer y panel admin. Vacío = usa el logo por defecto.
        </p>
        <NSSingleImageUploader name="brandLogo" initialValue={settings.brandLogo} label="Subir logo" />
      </div>

      <div className="border-t border-border pt-5">
        <NSLabel>Ícono de método de pago (ej. Cashea)</NSLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Se muestra como sello en las tarjetas de producto y en la ficha de producto. Vacío = no se muestra.
        </p>
        <NSSingleImageUploader
          name="paymentBadgeIcon"
          initialValue={settings.paymentBadgeIcon}
          label="Subir ícono"
        />
        <div className="mt-3">
          <NSLabel htmlFor="paymentBadgeLabel">Texto del método de pago</NSLabel>
          <NSInput
            id="paymentBadgeLabel"
            name="paymentBadgeLabel"
            defaultValue={settings.paymentBadgeLabel}
            placeholder="Disponible con Cashea"
          />
        </div>
      </div>

      <NSButton type="submit" loading={pending} className="self-start">
        Guardar configuración
      </NSButton>
    </form>
  );
}
