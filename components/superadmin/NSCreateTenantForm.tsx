"use client";

import { useActionState, useState } from "react";
import { createTenantBySuperadminAction, type SuperadminActionState } from "@/app/superadmin/actions";
import { NSInput, NSLabel, NSSelect, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { slugify } from "@/lib/utils/slug";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/tenant/business-type";

const initialState: SuperadminActionState = {};

export function NSCreateTenantForm() {
  const [state, formAction, pending] = useActionState(createTenantBySuperadminAction, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const previewSlug = slug || slugify(name);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div>
        <NSLabel htmlFor="name">Nombre comercial</NSLabel>
        <NSInput id="name" name="name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <NSLabel htmlFor="slug">Slug</NSLabel>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="shrink-0">ds-catalog.app/</span>
          <NSInput
            id="slug"
            name="slug"
            value={slugEdited ? slug : previewSlug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value);
            }}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <NSLabel htmlFor="businessType">Tipo de negocio</NSLabel>
        <NSSelect id="businessType" name="businessType" required defaultValue="">
          <option value="" disabled>
            Elige el tipo de negocio
          </option>
          {BUSINESS_TYPE_OPTIONS.map((profile) => (
            <option key={profile.value} value={profile.value}>
              {profile.label}
            </option>
          ))}
        </NSSelect>
        <p className="mt-1 text-xs text-muted-foreground">
          Define qué campos ve el cliente en su formulario de productos (tallas, colores) y con qué categorías arranca.
        </p>
      </div>

      <div>
        <NSLabel htmlFor="password">Contraseña inicial del panel</NSLabel>
        <NSInput id="password" name="password" type="password" required minLength={8} />
      </div>

      <div className="border-t border-border pt-5">
        <NSLabel htmlFor="contactEmail">Correo del administrador (opcional)</NSLabel>
        <NSInput id="contactEmail" name="contactEmail" type="email" />
      </div>
      <div>
        <NSLabel htmlFor="whatsappNumber">WhatsApp (opcional, con código de país)</NSLabel>
        <NSInput id="whatsappNumber" name="whatsappNumber" placeholder="584121234567" inputMode="numeric" />
      </div>
      <div>
        <NSLabel htmlFor="brandDescription">Descripción breve (opcional)</NSLabel>
        <NSTextarea id="brandDescription" name="brandDescription" rows={2} />
      </div>

      <NSButton type="submit" loading={pending} className="self-start">
        Crear cliente
      </NSButton>
    </form>
  );
}
