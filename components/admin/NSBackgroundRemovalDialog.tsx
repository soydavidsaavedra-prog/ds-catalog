"use client";

import { useEffect, useRef, useState } from "react";
import { NSButton } from "@/components/ui/NSButton";
import { removeImageBackground, cropToContent, compositeOnColor } from "@/lib/media/background-removal";

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
 * separate "start" step.
 *
 * The expensive step (removeImageBackground, the WASM segmentation model)
 * and the cheap crop-to-content step run exactly once per imageUrl and are
 * cached in croppedBlob. Toggling "usar el color de tu marca" only ever
 * re-runs compositeOnColor against that cached cropped blob — plain canvas
 * work, no re-segmentation — so the checkbox feels instant. The original
 * image is never modified regardless of outcome; onAccept only fires if the
 * admin explicitly picks the result.
 */
export function NSBackgroundRemovalDialog({
  imageUrl,
  accentColor,
  onAccept,
  onCancel,
}: {
  imageUrl: string;
  /** Tenant's brand accent color — when provided, offers a "usar el color de tu marca" option instead of leaving the cutout transparent. */
  accentColor?: string;
  onAccept: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("processing");
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [displayBlob, setDisplayBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [useBrandColor, setUseBrandColor] = useState(false);
  const displayBlobRef = useRef<Blob | null>(null);
  displayBlobRef.current = displayBlob;

  // Step 1 — the expensive part: WASM segmentation, then crop to content.
  // Runs once per imageUrl; cropped result is cached in croppedBlob.
  useEffect(() => {
    let cancelled = false;
    setPhase("processing");
    setCroppedBlob(null);
    setUseBrandColor(false);
    removeImageBackground(imageUrl)
      .then((blob) => cropToContent(blob))
      .then((cropped) => {
        if (cancelled) return;
        setCroppedBlob(cropped);
        setPhase("success");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // Step 2 — cheap: recompute what's displayed whenever the cached crop or
  // the brand-color toggle changes, without touching the WASM model again.
  useEffect(() => {
    if (!croppedBlob) return;
    let cancelled = false;
    (async () => {
      const blob = useBrandColor && accentColor ? await compositeOnColor(croppedBlob, accentColor) : croppedBlob;
      if (!cancelled) setDisplayBlob(blob);
    })();
    return () => {
      cancelled = true;
    };
  }, [croppedBlob, useBrandColor, accentColor]);

  // Step 3 — object URL lifecycle for whichever blob is currently displayed.
  useEffect(() => {
    if (!displayBlob) return;
    const url = URL.createObjectURL(displayBlob);
    setResultUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [displayBlob]);

  function handleAccept() {
    if (displayBlobRef.current) onAccept(displayBlobRef.current);
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
                  <div
                    className="aspect-square w-full overflow-hidden rounded-control border border-border"
                    style={useBrandColor ? undefined : TRANSPARENCY_BACKGROUND}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- see note above */}
                    <img src={resultUrl ?? undefined} alt="Sin fondo" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>

              {accentColor ? (
                <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={useBrandColor}
                    onChange={(e) => setUseBrandColor(e.target.checked)}
                    className="h-4 w-4 rounded border-border-strong accent-accent-strong"
                  />
                  <span>Usar el color de tu marca como fondo</span>
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden
                  />
                </label>
              ) : null}

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
