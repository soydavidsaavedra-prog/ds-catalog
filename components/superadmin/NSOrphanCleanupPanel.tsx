"use client";

import { useState, useTransition } from "react";
import { deleteOrphanedFilesAction, scanOrphanedFilesAction } from "@/app/superadmin/actions";
import type { OrphanedFile } from "@/lib/repositories/storage-repository";
import { NSButton } from "@/components/ui/NSButton";
import { formatBytes } from "@/lib/utils/format";

type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "done"; files: OrphanedFile[] }
  | { status: "deleted"; count: number }
  | { status: "error"; message: string };

/**
 * Per-tenant "find and delete orphaned Storage files" panel — see
 * findOrphanedFilesForTenant's doc comment (lib/repositories/
 * storage-repository.ts) for what counts as an orphan. Two explicit steps
 * (scan, then a separate confirmed delete) rather than one button, since
 * deleting a Storage object has no undo — a Super Admin always sees the
 * exact list and total size before anything is removed.
 */
export function NSOrphanCleanupPanel({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [state, setState] = useState<ScanState>({ status: "idle" });
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function scan() {
    setConfirming(false);
    setState({ status: "scanning" });
    startTransition(async () => {
      try {
        const files = await scanOrphanedFilesAction(tenantId, tenantSlug);
        setState({ status: "done", files });
      } catch {
        setState({ status: "error", message: "No se pudo analizar el storage de este cliente." });
      }
    });
  }

  function confirmDelete() {
    if (state.status !== "done") return;
    const paths = state.files.map((f) => f.path);
    startTransition(async () => {
      try {
        const { deletedCount } = await deleteOrphanedFilesAction(tenantId, tenantSlug, paths);
        setState({ status: "deleted", count: deletedCount });
        setConfirming(false);
      } catch {
        setState({ status: "error", message: "No se pudieron eliminar los archivos." });
      }
    });
  }

  if (state.status === "idle") {
    return (
      <NSButton variant="ghost" size="sm" onClick={scan} disabled={pending}>
        Buscar archivos huérfanos
      </NSButton>
    );
  }

  if (state.status === "scanning") {
    return <p className="text-xs text-muted-foreground">Analizando productos, pedidos, banners y más…</p>;
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center gap-3">
        <p className="text-xs text-danger">{state.message}</p>
        <NSButton variant="ghost" size="sm" onClick={scan} disabled={pending}>
          Reintentar
        </NSButton>
      </div>
    );
  }

  if (state.status === "deleted") {
    return (
      <p className="text-xs text-muted-foreground">
        Se eliminaron {state.count} archivo{state.count === 1 ? "" : "s"} huérfano{state.count === 1 ? "" : "s"}.
      </p>
    );
  }

  // status === "done"
  const totalBytes = state.files.reduce((sum, f) => sum + f.sizeBytes, 0);

  if (state.files.length === 0) {
    return <p className="text-xs text-muted-foreground">No se encontraron archivos huérfanos en este cliente.</p>;
  }

  return (
    <div className="rounded-control border border-border bg-surface p-3">
      <p className="text-xs text-foreground">
        {state.files.length} archivo{state.files.length === 1 ? "" : "s"} sin ninguna referencia en el catálogo, los
        pedidos ni la configuración — {formatBytes(totalBytes)} recuperables.
      </p>
      <ul className="mt-2 max-h-32 overflow-y-auto text-xs text-muted-foreground">
        {state.files.slice(0, 20).map((f) => (
          <li key={f.path} className="truncate font-mono">
            {f.path} · {formatBytes(f.sizeBytes)}
          </li>
        ))}
        {state.files.length > 20 ? <li>… y {state.files.length - 20} más</li> : null}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!confirming ? (
          <NSButton variant="outline" size="sm" onClick={() => setConfirming(true)} disabled={pending}>
            Eliminar {state.files.length} archivo{state.files.length === 1 ? "" : "s"}
          </NSButton>
        ) : (
          <>
            <span className="text-xs font-semibold text-danger">Esta acción no se puede deshacer.</span>
            <NSButton variant="primary" size="sm" onClick={confirmDelete} loading={pending}>
              Confirmar eliminación
            </NSButton>
            <NSButton variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
              Cancelar
            </NSButton>
          </>
        )}
        <NSButton variant="ghost" size="sm" onClick={scan} disabled={pending}>
          Volver a analizar
        </NSButton>
      </div>
    </div>
  );
}
