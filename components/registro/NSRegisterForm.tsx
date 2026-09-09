"use client";

import { useActionState, useState } from "react";
import { registerTenantAction } from "@/app/registro/actions";
import type { ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { slugify } from "@/lib/utils/slug";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/tenant/business-type";

const initialState: ActionState = {};

export function NSRegisterForm() {
  const [state, formAction, pending] = useActionState(registerTenantAction, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const previewSlug = slug || slugify(name);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div>
        <NSLabel htmlFor="name">Nombre del negocio</NSLabel>
        <NSInput
          id="name"
          name="name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Panadería Luna"
        />
      </div>

      <div>
        <NSLabel htmlFor="email">Correo</NSLabel>
        <NSInput id="email" name="email" type="email" required autoComplete="username" />
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
          Así preparamos tu catálogo con los campos y categorías que le sirven a tu negocio.
        </p>
      </div>

      <div>
        <NSLabel htmlFor="slug">Enlace de tu catálogo</NSLabel>
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
            placeholder="panaderia-luna"
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <NSLabel htmlFor="password">Contraseña</NSLabel>
        <NSInput id="password" name="password" type="password" required minLength={8} />
      </div>

      <div>
        <NSLabel htmlFor="confirmPassword">Confirmar contraseña</NSLabel>
        <NSInput id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
      </div>

      <NSButton type="submit" loading={pending} className="w-full">
        Crear mi catálogo
      </NSButton>
    </form>
  );
}
