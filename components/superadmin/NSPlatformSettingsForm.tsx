"use client";

import { useActionState } from "react";
import { updatePlatformSettingsAction, type SuperadminActionState } from "@/app/superadmin/actions";
import type { PlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: SuperadminActionState = {};

export function NSPlatformSettingsForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction, pending] = useActionState(updatePlatformSettingsAction, initialState);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}
      <div>
        <NSLabel htmlFor="supportWhatsappNumber">Número (solo dígitos, con código de país)</NSLabel>
        <NSInput
          id="supportWhatsappNumber"
          name="supportWhatsappNumber"
          defaultValue={settings.supportWhatsappNumber}
          placeholder="584245210934"
          inputMode="numeric"
          required
        />
      </div>
      <div>
        <NSLabel htmlFor="supportWhatsappDisplay">Cómo se muestra</NSLabel>
        <NSInput
          id="supportWhatsappDisplay"
          name="supportWhatsappDisplay"
          defaultValue={settings.supportWhatsappDisplay}
          placeholder="+58 424 521 0934"
        />
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-foreground">Legal</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Términos y Política de Privacidad de DS Catalog (para quien se registra en /registro) — no lo de cada
          cliente. Vacío = la página y el enlace no existen. Este texto lo defines tú (o tu abogado): no es asesoría
          legal ni un modelo generado automáticamente.
        </p>
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <NSLabel htmlFor="termsContent">Términos y condiciones</NSLabel>
            <NSTextarea
              id="termsContent"
              name="termsContent"
              defaultValue={settings.termsContent}
              rows={8}
              placeholder="Pega o escribe aquí los términos y condiciones de DS Catalog..."
            />
          </div>
          <div>
            <NSLabel htmlFor="privacyContent">Política de privacidad</NSLabel>
            <NSTextarea
              id="privacyContent"
              name="privacyContent"
              defaultValue={settings.privacyContent}
              rows={8}
              placeholder="Pega o escribe aquí la política de privacidad de DS Catalog..."
            />
          </div>
        </div>
      </div>
      <NSButton type="submit" loading={pending} size="sm" className="self-start">
        Guardar
      </NSButton>
    </form>
  );
}
