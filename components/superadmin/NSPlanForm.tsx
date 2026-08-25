"use client";

import { useActionState, useState } from "react";
import { createPlanAction, updatePlanAction, type SuperadminActionState } from "@/app/superadmin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import type { Plan } from "@/lib/repositories/plans-repository";

const initialState: SuperadminActionState = {};

interface NSPlanFormProps {
  /** Real platform-wide average (totalStorageBytes / totalProducts) — null if there are no products yet to derive one from. Never a guessed constant. */
  avgBytesPerProduct: number | null;
  plan?: Plan;
}

export function NSPlanForm({ avgBytesPerProduct, plan }: NSPlanFormProps) {
  const boundAction = plan ? updatePlanAction.bind(null, plan.id) : createPlanAction;
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [maxStorageMb, setMaxStorageMb] = useState(plan?.maxStorageMb?.toString() ?? "");

  const estimatedProducts = (() => {
    if (!avgBytesPerProduct || avgBytesPerProduct <= 0) return null;
    const mb = Number(maxStorageMb);
    if (!Number.isFinite(mb) || mb <= 0) return null;
    return Math.floor((mb * 1024 * 1024) / avgBytesPerProduct);
  })();

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <NSLabel htmlFor="key">Clave {plan ? "" : "(única)"}</NSLabel>
          <NSInput id="key" name="key" required={!plan} disabled={Boolean(plan)} defaultValue={plan?.key} placeholder="pro" />
          {plan ? <p className="mt-1 text-xs text-muted-foreground">La clave no se puede cambiar una vez creado el plan.</p> : null}
        </div>
        <div>
          <NSLabel htmlFor="name">Nombre</NSLabel>
          <NSInput id="name" name="name" required defaultValue={plan?.name} placeholder="Pro" />
        </div>
      </div>

      <div>
        <NSLabel htmlFor="description">Descripción</NSLabel>
        <NSTextarea id="description" name="description" rows={2} defaultValue={plan?.description} />
      </div>

      <div>
        <NSLabel htmlFor="price">Precio mensual (USD)</NSLabel>
        <NSInput
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={plan ? (plan.priceCents / 100).toFixed(2) : undefined}
          placeholder="29.00"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <NSLabel htmlFor="maxProducts">Máx. productos</NSLabel>
          <NSInput id="maxProducts" name="maxProducts" type="number" min="0" defaultValue={plan?.maxProducts ?? undefined} placeholder="Sin límite" />
        </div>
        <div>
          <NSLabel htmlFor="maxStorageMb">Storage (MB)</NSLabel>
          <NSInput
            id="maxStorageMb"
            name="maxStorageMb"
            type="number"
            min="0"
            value={maxStorageMb}
            onChange={(e) => setMaxStorageMb(e.target.value)}
            placeholder="Sin límite"
          />
        </div>
        <div>
          <NSLabel htmlFor="maxImages">Máx. imágenes</NSLabel>
          <NSInput id="maxImages" name="maxImages" type="number" min="0" defaultValue={plan?.maxImages ?? undefined} placeholder="Sin límite" />
        </div>
      </div>

      {estimatedProducts !== null ? (
        <p className="text-xs text-muted-foreground">
          ≈ <span className="font-semibold text-foreground">{estimatedProducts.toLocaleString("es")} productos</span>{" "}
          estimados con ese storage, según el promedio real actual de la plataforma (
          {(avgBytesPerProduct! / (1024 * 1024)).toFixed(2)} MB/producto). Es solo una guía — el límite real que se
          aplica es el de productos, arriba.
        </p>
      ) : null}

      <div>
        <NSLabel htmlFor="features">Características (una por línea)</NSLabel>
        <NSTextarea
          id="features"
          name="features"
          rows={3}
          defaultValue={plan?.features.join("\n")}
          placeholder={"Catálogo público\nPedidos por WhatsApp"}
        />
      </div>

      <NSButton type="submit" loading={pending} className="self-start">
        {plan ? "Guardar cambios" : "Crear plan"}
      </NSButton>
    </form>
  );
}
