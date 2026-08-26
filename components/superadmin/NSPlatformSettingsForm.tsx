"use client";

import { useActionState } from "react";
import { updatePlatformSettingsAction, type SuperadminActionState } from "@/app/superadmin/actions";
import type { PlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
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
      <NSButton type="submit" loading={pending} size="sm" className="self-start">
        Guardar
      </NSButton>
    </form>
  );
}
