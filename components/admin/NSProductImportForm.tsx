"use client";

import { useState } from "react";
import { importProductsAction, type ImportProductsResult } from "@/app/[tenant]/admin/(shell)/productos/importar/actions";
import type { ProductImportPhoto } from "@/lib/products/csv-import";
import { compressImageBeforeUpload } from "@/lib/utils/image-compress";
import { NSButton } from "@/components/ui/NSButton";
import { DSCard } from "@/components/ui/DSCard";

type Phase =
  | { status: "idle" }
  | { status: "uploading"; done: number; total: number }
  | { status: "importing" }
  | { status: "done"; result: ImportProductsResult }
  | { status: "error"; message: string };

export function NSProductImportForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>({ status: "idle" });

  const busy = phase.status === "uploading" || phase.status === "importing";

  async function handleSubmit() {
    if (!csvFile) return;

    const csvText = await csvFile.text();
    const photos: ProductImportPhoto[] = [];

    if (photoFiles.length > 0) {
      setPhase({ status: "uploading", done: 0, total: photoFiles.length });
      for (const file of photoFiles) {
        try {
          const formData = new FormData();
          formData.append("file", await compressImageBeforeUpload(file));
          const res = await fetch(`/${tenantSlug}/admin/api/upload`, { method: "POST", body: formData });
          const data = await res.json().catch(() => null);
          if (res.ok && data?.url) photos.push({ filename: file.name, url: data.url });
          // A photo that fails to upload just won't be matched by the CSV's
          // "foto" column later — parseProductImportCsv reports that as a
          // per-row warning, so there's nothing else to do with the failure here.
        } catch {
          // Same as above: an unmatched "foto" value surfaces as a warning downstream.
        }
        setPhase((prev) => (prev.status === "uploading" ? { status: "uploading", done: prev.done + 1, total: prev.total } : prev));
      }
    }

    setPhase({ status: "importing" });
    const response = await importProductsAction(tenantId, tenantSlug, csvText, photos);
    if (response.error) {
      setPhase({ status: "error", message: response.error });
      return;
    }
    setCsvFile(null);
    setPhotoFiles([]);
    setPhase({ status: "done", result: response.result! });
  }

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
            <span className="font-medium text-foreground">precio_anterior, descripcion, tallas, disponibilidad,
            destacado, nuevo, oferta, foto, stock</span> — opcionales.
          </li>
          <li>
            <span className="font-medium text-foreground">tallas</span> se separan con punto y coma dentro de la celda
            (ej. <code className="rounded bg-surface px-1">S;M;L</code>).
          </li>
          <li>
            <span className="font-medium text-foreground">precio_anterior</span> es opcional — si pones ahí un valor
            mayor al de <span className="font-medium text-foreground">precio</span>, el producto se muestra en oferta
            con ese precio tachado.
          </li>
          <li>
            <span className="font-medium text-foreground">foto</span> es el nombre exacto de un archivo que subas junto
            con el CSV más abajo (ej. <code className="rounded bg-surface px-1">camisa-azul.jpg</code>) — así cada
            producto sale con su foto real en vez del marcador de posición. Sin esa columna, o si el nombre no
            coincide con ninguna foto subida, el producto igual se crea, solo que con el marcador de posición.
          </li>
          <li>
            <span className="font-medium text-foreground">stock</span> es opcional — si le pones un número, ese
            producto pasa a llevar inventario real (su disponibilidad se calcula sola y baja con cada pedido) en vez
            de usar la columna <span className="font-medium text-foreground">disponibilidad</span>.
          </li>
          <li>
            La importación <span className="font-medium text-foreground">no incluye colores</span> — se agregan
            después, editando cada producto normalmente.
          </li>
        </ul>
      </DSCard>

      <DSCard>
        <div className="flex flex-col gap-4">
          {phase.status === "error" ? (
            <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
              {phase.message}
            </div>
          ) : null}

          <div>
            <label htmlFor="file" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Archivo CSV
            </label>
            <input
              id="file"
              type="file"
              accept=".csv,text/csv"
              disabled={busy}
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-control border border-border-strong bg-surface-elevated px-3 py-2 text-sm file:mr-3 file:rounded-control file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-accent-foreground"
            />
          </div>

          <div>
            <label htmlFor="photos" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fotos (opcional)
            </label>
            <input
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={busy}
              onChange={(e) => setPhotoFiles(e.target.files ? Array.from(e.target.files) : [])}
              className="block w-full rounded-control border border-border-strong bg-surface-elevated px-3 py-2 text-sm file:mr-3 file:rounded-control file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-accent-foreground"
            />
            {photoFiles.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {photoFiles.length} foto(s) seleccionada(s) — se asocian por nombre de archivo a la columna &quot;foto&quot; del CSV.
              </p>
            ) : null}
          </div>

          <NSButton type="button" onClick={handleSubmit} disabled={!csvFile} loading={busy} className="self-start">
            {phase.status === "uploading"
              ? `Subiendo fotos ${phase.done}/${phase.total}...`
              : phase.status === "importing"
                ? "Importando..."
                : "Importar"}
          </NSButton>
        </div>
      </DSCard>

      {phase.status === "done" ? (
        <DSCard>
          <p className="text-sm font-medium text-foreground">
            {phase.result.imported} producto{phase.result.imported === 1 ? "" : "s"} importado
            {phase.result.imported === 1 ? "" : "s"}.
          </p>
          {phase.result.errors.length > 0 ? (
            <>
              <p className="mt-3 text-sm font-medium text-foreground">
                {phase.result.errors.length} fila{phase.result.errors.length === 1 ? "" : "s"} con problemas:
              </p>
              <ul className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto text-xs text-muted-foreground">
                {phase.result.errors.map((e) => (
                  <li key={`error-${e.line}`}>
                    <span className="font-mono text-foreground">Fila {e.line}:</span> {e.reason}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {phase.result.warnings.length > 0 ? (
            <>
              <p className="mt-3 text-sm font-medium text-foreground">
                {phase.result.warnings.length} foto{phase.result.warnings.length === 1 ? "" : "s"} no encontrada
                {phase.result.warnings.length === 1 ? "" : "s"} (el producto se creó igual, con marcador de posición):
              </p>
              <ul className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto text-xs text-muted-foreground">
                {phase.result.warnings.map((w) => (
                  <li key={`warning-${w.line}`}>
                    <span className="font-mono text-foreground">Fila {w.line}:</span> {w.reason}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {phase.result.imported > 0 ? (
            <NSButton href={`/${tenantSlug}/admin/productos`} variant="outline" size="sm" className="mt-4">
              Ver productos
            </NSButton>
          ) : null}
        </DSCard>
      ) : null}
    </div>
  );
}
