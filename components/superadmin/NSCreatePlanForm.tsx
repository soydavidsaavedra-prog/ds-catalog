"use client";

import { useActionState } from "react";
import { createPlanAction, type SuperadminActionState } from "@/app/superadmin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

const initialState: SuperadminActionState = {};

export function NSCreatePlanForm() {
  const [state, formAction, pending] = useActionState(createPlanAction, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <NSLabel htmlFor="key">Clave (única)</NSLabel>
          <NSInput id="key" name="key" required placeholder="pro" />
        </div>
        <div>
          <NSLabel htmlFor="name">Nombre</NSLabel>
          <NSInput id="name" name="name" required placeholder="Pro" />
        </div>
      </div>

      <div>
        <NSLabel htmlFor="description">Descripción</NSLabel>
        <NSTextarea id="description" name="description" rows={2} />
      </div>

      <div>
        <NSLabel htmlFor="price">Precio mensual (USD)</NSLabel>
        <NSInput id="price" name="price" type="number" step="0.01" min="0" placeholder="29.00" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <NSLabel htmlFor="maxProducts">Máx. productos</NSLabel>
          <NSInput id="maxProducts" name="maxProducts" type="number" min="0" placeholder="Sin límite" />
        </div>
        <div>
          <NSLabel htmlFor="maxStorageMb">Storage (MB)</NSLabel>
          <NSInput id="maxStorageMb" name="maxStorageMb" type="number" min="0" placeholder="Sin límite" />
        </div>
        <div>
          <NSLabel htmlFor="maxImages">Máx. imágenes</NSLabel>
          <NSInput id="maxImages" name="maxImages" type="number" min="0" placeholder="Sin límite" />
        </div>
      </div>

      <div>
        <NSLabel htmlFor="features">Características (una por línea)</NSLabel>
        <NSTextarea id="features" name="features" rows={3} placeholder={"Catálogo público\nPedidos por WhatsApp"} />
      </div>

      <NSButton type="submit" loading={pending} className="self-start">
        Crear plan
      </NSButton>
    </form>
  );
}
