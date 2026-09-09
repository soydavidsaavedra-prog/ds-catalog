"use client";

import { useActionState } from "react";
import { importProductsAction, type ImportProductsActionState } from "@/app/[tenant]/admin/(shell)/productos/importar/actions";
import { NSButton } from "@/components/ui/NSButton";
import { DSCard } from "@/components/ui/DSCard";

const initialState: ImportProductsActionState = {};

export function NSProductImportForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const boundAction = importProductsAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="flex flex-col gap-6">
      <DSCard
        title="Formato del archivo"
        description="Un CSV separado por comas, con la primera fila de encabezados exactamente como en la plantilla."
      >
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">referencia, nombre, precio, categoria</span> — obligatorios. La
            categoría debe existir ya en tu catálogo (por nombre o por slug).
          </li>
          <li>
            <span className="font-medium text-foreground">precio_mayorista, descripcion, tallas, disponibilidad,
            destacado, nuevo, oferta</span> — opcionales.
          </li>
          <li>
            <span className="font-medium text-foreground">tallas</span> se separan con punto y coma dentro de la celda
            (ej. <code className="rounded bg-surface px-1">S;M;L</code>).
          </li>
          <li>
            La importación <span className="font-medium text-foreground">no incluye fotos ni colores</span> — cada
            producto se crea con la imagen de marcador de posición y se le agregan fotos/colores después, editándolo
            normalmente.
          </li>
        </ul>
      </DSCard>

      <DSCard>
        <form action={formAction} className="flex flex-col gap-4">
          {state.error ? (
            <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
              {state.error}
            </div>
          ) : null}

          <div>
            <label htmlFor="file" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Archivo CSV
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".csv,text/csv"
              required
              className="block w-full rounded-control border border-border-strong bg-surface-elevated px-3 py-2 text-sm file:mr-3 file:rounded-control file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-accent-foreground"
            />
          </div>

          <NSButton type="submit" loading={pending} className="self-start">
            Importar
          </NSButton>
        </form>
      </DSCard>

      {state.result ? (
        <DSCard>
          <p className="text-sm font-medium text-foreground">
            {state.result.imported} producto{state.result.imported === 1 ? "" : "s"} importado
            {state.result.imported === 1 ? "" : "s"}.
          </p>
          {state.result.errors.length > 0 ? (
            <>
              <p className="mt-3 text-sm font-medium text-foreground">
                {state.result.errors.length} fila{state.result.errors.length === 1 ? "" : "s"} con problemas:
              </p>
              <ul className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto text-xs text-muted-foreground">
                {state.result.errors.map((e) => (
                  <li key={e.line}>
                    <span className="font-mono text-foreground">Fila {e.line}:</span> {e.reason}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {state.result.imported > 0 ? (
            <NSButton href={`/${tenantSlug}/admin/productos`} variant="outline" size="sm" className="mt-4">
              Ver productos
            </NSButton>
          ) : null}
        </DSCard>
      ) : null}
    </div>
  );
}
