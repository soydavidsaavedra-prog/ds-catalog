"use client";

import { useActionState, useState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import { updateSettingsAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";

const PLATFORM_DEFAULT_ACCENT = "#00a19a";
const PLATFORM_DEFAULT_ACCENT_STRONG = "#006e69";

const initialState: ActionState = {};

export function NSSettingsForm({ tenantId, tenantSlug, settings }: { tenantId: string; tenantSlug: string; settings: SiteSettings }) {
  const boundAction = updateSettingsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [customAccentColor, setCustomAccentColor] = useState(Boolean(settings.accentColor));

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.success ? (
        <div className="rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
          Configuración guardada.
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
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
        <NSLabel htmlFor="brandDescription">Descripción (footer)</NSLabel>
        <NSTextarea id="brandDescription" name="brandDescription" defaultValue={settings.brandDescription} rows={2} />
      </div>
      <div>
        <NSLabel htmlFor="whatsappNumber">Número de WhatsApp (con código de país, solo dígitos)</NSLabel>
        <NSInput id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber} placeholder="584121234567" required />
      </div>
      <div>
        <NSLabel htmlFor="whatsappDisplay">Número de WhatsApp (formateado, para mostrar)</NSLabel>
        <NSInput id="whatsappDisplay" name="whatsappDisplay" defaultValue={settings.whatsappDisplay} placeholder="+58 412 123 4567" />
      </div>
      <div>
        <NSLabel htmlFor="currency">Moneda</NSLabel>
        <NSInput id="currency" name="currency" defaultValue={settings.currency} />
      </div>

      <div className="border-t border-border pt-5">
        <NSLabel htmlFor="contactEmail">Correo de contacto</NSLabel>
        <NSInput id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} placeholder="ventas@tunegocio.com" />
      </div>
      <div>
        <NSLabel htmlFor="contactAddress">Dirección</NSLabel>
        <NSInput id="contactAddress" name="contactAddress" defaultValue={settings.contactAddress} placeholder="Tu ciudad, país" />
      </div>
      <div>
        <NSLabel htmlFor="contactMapsUrl">Enlace de Google Maps</NSLabel>
        <NSInput
          id="contactMapsUrl"
          name="contactMapsUrl"
          defaultValue={settings.contactMapsUrl}
          placeholder="https://maps.app.goo.gl/..."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Abre Google Maps, busca tu ubicación, dale &quot;Compartir&quot; y pega el enlace aquí. La dirección
          en el footer quedará como link a ese mapa.
        </p>
      </div>

      <div className="border-t border-border pt-5">
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
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="customAccentColor"
            checked={customAccentColor}
            onChange={(e) => setCustomAccentColor(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
          />
          Personalizar color de marca
        </label>
        <p className="mt-1 mb-3 text-xs text-muted-foreground">
          Si no lo personalizas, tu catálogo usa el turquesa por defecto de DS Catalog. Este color se usa en
          botones, enlaces y acentos de todo el sitio y del panel.
        </p>
        {customAccentColor ? (
          <div className="flex items-center gap-6">
            <div>
              <NSLabel htmlFor="accentColor">Color principal</NSLabel>
              <input
                type="color"
                id="accentColor"
                name="accentColor"
                defaultValue={settings.accentColor ?? PLATFORM_DEFAULT_ACCENT}
                className="h-11 w-16 cursor-pointer rounded-control border border-border bg-transparent p-1"
              />
            </div>
            <div>
              <NSLabel htmlFor="accentColorStrong">Color al pasar el mouse</NSLabel>
              <input
                type="color"
                id="accentColorStrong"
                name="accentColorStrong"
                defaultValue={settings.accentColorStrong ?? PLATFORM_DEFAULT_ACCENT_STRONG}
                className="h-11 w-16 cursor-pointer rounded-control border border-border bg-transparent p-1"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border pt-5">
        <NSLabel>Logo de marca</NSLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Reemplaza el logo recreado en el header, footer y panel admin. Vacío = usa el logo por defecto.
        </p>
        <NSSingleImageUploader tenantSlug={tenantSlug} name="brandLogo" initialValue={settings.brandLogo} label="Subir logo" />
      </div>

      <div className="border-t border-border pt-5">
        <NSLabel>Ícono de método de pago (ej. Cashea)</NSLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Se muestra como sello en las tarjetas de producto y en la ficha de producto. Vacío = no se muestra.
        </p>
        <NSSingleImageUploader
          tenantSlug={tenantSlug}
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
