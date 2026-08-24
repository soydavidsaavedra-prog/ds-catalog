"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import { updateSettingsAction, type ActionState } from "@/app/admin/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

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

      <NSButton type="submit" loading={pending} className="self-start">
        Guardar configuración
      </NSButton>
    </form>
  );
}
