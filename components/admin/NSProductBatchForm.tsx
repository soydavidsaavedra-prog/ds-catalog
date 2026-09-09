"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/catalog";
import { createProductBatchAction, type ProductBatchError } from "@/app/[tenant]/admin/(shell)/productos/lote-fotos/actions";
import { MAX_BATCH_IMAGES } from "@/lib/products/image-batch";
import { compressImageBeforeUpload } from "@/lib/utils/image-compress";
import { NSLabel, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { DSCard } from "@/components/ui/DSCard";

type Phase =
  | { status: "idle" }
  | { status: "uploading"; done: number; total: number }
  | { status: "creating" }
  | { status: "done"; created: number; errors: ProductBatchError[] }
  | { status: "error"; message: string };

export function NSProductBatchForm({
  tenantId,
  tenantSlug,
  categories,
}: {
  tenantId: string;
  tenantSlug: string;
  categories: Category[];
}) {
  const [categorySlug, setCategorySlug] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [truncated, setTruncated] = useState(0);
  const [phase, setPhase] = useState<Phase>({ status: "idle" });

  const busy = phase.status === "uploading" || phase.status === "creating";

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const selected = Array.from(fileList).slice(0, MAX_BATCH_IMAGES);
    setTruncated(fileList.length - selected.length);
    setFiles(selected);
    setPhase({ status: "idle" });
  }

  async function handleSubmit() {
    if (files.length === 0 || !categorySlug) return;

    setPhase({ status: "uploading", done: 0, total: files.length });
    const items: { filename: string; url: string }[] = [];
    const uploadErrors: ProductBatchError[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", await compressImageBeforeUpload(file));
        const res = await fetch(`/${tenantSlug}/admin/api/upload`, { method: "POST", body: formData });
        const data = await res.json().catch(() => null);

        if (res.status === 403) {
          uploadErrors.push({ filename: file.name, reason: data?.error ?? "Alcanzaste el límite de tu plan." });
          break; // Every remaining file would fail the exact same way — stop instead of burning through the rest.
        }
        if (!res.ok || !data?.url) {
          throw new Error(data?.error ?? `No se pudo subir (${res.status}).`);
        }
        items.push({ filename: file.name, url: data.url });
      } catch (err) {
        uploadErrors.push({ filename: file.name, reason: err instanceof Error ? err.message : "Error al subir." });
      }
      setPhase((prev) => (prev.status === "uploading" ? { status: "uploading", done: prev.done + 1, total: prev.total } : prev));
    }

    if (items.length === 0) {
      setPhase({ status: "done", created: 0, errors: uploadErrors });
      return;
    }

    setPhase({ status: "creating" });
    try {
      const result = await createProductBatchAction(tenantId, tenantSlug, categorySlug, items);
      setPhase({ status: "done", created: result.created, errors: [...uploadErrors, ...result.errors] });
    } catch {
      setPhase({ status: "error", message: "No se pudieron crear los productos. Intenta de nuevo en un momento." });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DSCard title="1. Elige la categoría" description="Todos los productos de este lote quedan en esta misma categoría.">
        <NSSelect value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} disabled={busy} required>
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categories
            .filter((c) => c.parentId === null)
            .map((parent) => {
              const children = categories.filter((c) => c.parentId === parent.id);
              if (children.length === 0) {
                return (
                  <option key={parent.slug} value={parent.slug}>
                    {parent.name}
                  </option>
                );
              }
              return (
                <optgroup key={parent.id} label={parent.name}>
                  {children.map((child) => (
                    <option key={child.slug} value={child.slug}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
        </NSSelect>
      </DSCard>

      <DSCard
        title="2. Sube las fotos"
        description={`Una foto = un producto en borrador. Máximo ${MAX_BATCH_IMAGES} por lote — súbelo en varias tandas si tienes más.`}
      >
        <div>
          <NSLabel htmlFor="batchFiles">Fotos</NSLabel>
          <input
            id="batchFiles"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={busy}
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="block w-full rounded-control border border-border-strong bg-surface-elevated px-3 py-2 text-sm file:mr-3 file:rounded-control file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-accent-foreground"
          />
          {files.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">{files.length} foto(s) seleccionada(s).</p>
          ) : null}
          {truncated > 0 ? (
            <p className="mt-1 text-xs text-warning">
              Solo se usarán las primeras {MAX_BATCH_IMAGES} — quedaron {truncated} fuera. Súbelas en otro lote.
            </p>
          ) : null}
        </div>
      </DSCard>

      <div>
        <NSButton
          type="button"
          onClick={handleSubmit}
          disabled={files.length === 0 || !categorySlug}
          loading={busy}
          className="self-start"
        >
          {phase.status === "uploading"
            ? `Subiendo ${phase.done}/${phase.total}...`
            : phase.status === "creating"
              ? "Creando productos..."
              : "Crear productos"}
        </NSButton>
      </div>

      {phase.status === "error" ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">{phase.message}</div>
      ) : null}

      {phase.status === "done" ? (
        <DSCard>
          <p className="text-sm font-medium text-foreground">
            {phase.created} producto{phase.created === 1 ? "" : "s"} creado{phase.created === 1 ? "" : "s"} en
            borrador (oculto{phase.created === 1 ? "" : "s"} del catálogo público hasta que lo{phase.created === 1 ? "" : "s"}{" "}
            actives).
          </p>
          {phase.errors.length > 0 ? (
            <>
              <p className="mt-3 text-sm font-medium text-foreground">
                {phase.errors.length} imagen{phase.errors.length === 1 ? "" : "es"} con problemas:
              </p>
              <ul className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto text-xs text-muted-foreground">
                {phase.errors.map((e, i) => (
                  <li key={`${e.filename}-${i}`}>
                    <span className="font-mono text-foreground">{e.filename}:</span> {e.reason}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {phase.created > 0 ? (
            <NSButton href={`/${tenantSlug}/admin/productos?estado=inactivo`} variant="outline" size="sm" className="mt-4">
              Ver borradores
            </NSButton>
          ) : null}
        </DSCard>
      ) : null}
    </div>
  );
}
