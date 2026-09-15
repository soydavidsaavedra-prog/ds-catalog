"use client";

import { useEffect, useRef, useState } from "react";
import { NSButton } from "@/components/ui/NSButton";
import { removeImageBackground } from "@/lib/media/background-removal";

type Phase = "processing" | "success" | "error";

/** Checkerboard so a transparent result actually reads as transparent, not as a broken/blank image. */
const TRANSPARENCY_BACKGROUND: React.CSSProperties = {
  backgroundImage:
    "conic-gradient(var(--border) 25%, transparent 0 50%, var(--border) 0 75%, transparent 0)",
  backgroundSize: "16px 16px",
};

/**
 * Opens already processing (per the requested UX: click "Quitar fondo" ->
 * immediately "Procesando imagen..." -> compare -> accept/cancel), not a
 * separate "start" step. Runs lib/media/background-removal.ts once on
 * mount; the original image is never modified regardless of outcome —
 * onAccept only fires if the admin explicitly picks the result.
 */
export function NSBackgroundRemovalDialog({
  imageUrl,
  onAccept,
  onCancel,
}: {
  imageUrl: string;
  onAccept: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("processing");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const resultBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPhase("processing");
    removeImageBackground(imageUrl)
      .then((blob) => {
        if (cancelled) return;
        resultBlobRef.current = blob;
        setResultUrl(URL.createObjectURL(blob));
        setPhase("success");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function handleAccept() {
    if (resultBlobRef.current) onAccept(resultBlobRef.current);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[var(--overlay)]" onClick={onCancel} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Quitar fondo">
        <div
          className="w-full max-w-2xl rounded-card border border-border bg-surface-elevated p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-display text-lg uppercase tracking-wide">Quitar fondo</h2>

          {phase === "processing" ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <span
                className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">Procesando imagen...</p>
            </div>
          ) : phase === "error" ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
              <p className="max-w-xs text-sm text-danger">
                No pudimos eliminar el fondo. La imagen original permanece intacta.
              </p>
              <NSButton variant="outline" size="sm" onClick={onCancel}>
                Cerrar
              </NSButton>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original</p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- comparing an arbitrary Storage URL + a local blob: URL side by side, neither fits next/image's remote-pattern/static-import model */}
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="aspect-square w-full rounded-control border border-border bg-surface object-contain"
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sin fondo</p>
                  <div className="aspect-square w-full overflow-hidden rounded-control border border-border" style={TRANSPARENCY_BACKGROUND}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- see note above */}
                    <img src={resultUrl ?? undefined} alt="Sin fondo" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <NSButton onClick={handleAccept}>Usar resultado</NSButton>
                <NSButton variant="outline" onClick={onCancel}>
                  Cancelar
                </NSButton>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
