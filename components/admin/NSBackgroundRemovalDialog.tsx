"use client";

import { useEffect, useRef, useState } from "react";
import { NSButton } from "@/components/ui/NSButton";
import { removeImageBackground, compositeOnColor, compositeOnImage } from "@/lib/media/background-removal";

type Phase = "processing" | "success" | "error";
type BgMode = "transparent" | "brand" | "custom-color" | "custom-image";

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
 * runs exactly once per imageUrl and is cached in cutoutBlob, at the
 * photo's original size (no auto-crop to content — that shifted the
 * subject relative to how the product card frames it, which read as
 * inconsistent against the tenant's other photos). Switching the
 * background (transparent / brand color / custom color / custom image)
 * only ever re-runs a cheap canvas composite against that cached cutout —
 * never the WASM model again. The original image is never modified
 * regardless of outcome; onAccept only fires if the admin explicitly picks
 * the result.
 */
export function NSBackgroundRemovalDialog({
  imageUrl,
  accentColor,
  onAccept,
  onCancel,
}: {
  imageUrl: string;
  /** Tenant's brand accent color — when provided, offers it as a one-click background option. */
  accentColor?: string;
  onAccept: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("processing");
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [displayBlob, setDisplayBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<BgMode>("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [customImage, setCustomImage] = useState<File | null>(null);
  const displayBlobRef = useRef<Blob | null>(null);
  displayBlobRef.current = displayBlob;

  // Step 1 — the expensive part: WASM segmentation. Runs once per imageUrl.
  useEffect(() => {
    let cancelled = false;
    setPhase("processing");
    setCutoutBlob(null);
    setMode("transparent");
    setCustomImage(null);
    removeImageBackground(imageUrl)
      .then((blob) => {
        if (cancelled) return;
        setCutoutBlob(blob);
        setPhase("success");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // Step 2 — cheap: recompute what's displayed whenever the cached cutout
  // or the chosen background changes, without touching the WASM model again.
  useEffect(() => {
    if (!cutoutBlob) return;
    let cancelled = false;
    (async () => {
      let blob = cutoutBlob;
      if (mode === "brand" && accentColor) blob = await compositeOnColor(cutoutBlob, accentColor);
      else if (mode === "custom-color") blob = await compositeOnColor(cutoutBlob, customColor);
      else if (mode === "custom-image" && customImage) blob = await compositeOnImage(cutoutBlob, customImage);
      if (!cancelled) setDisplayBlob(blob);
    })();
    return () => {
      cancelled = true;
    };
  }, [cutoutBlob, mode, accentColor, customColor, customImage]);

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
                    style={mode === "transparent" ? TRANSPARENCY_BACKGROUND : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- see note above */}
                    <img src={resultUrl ?? undefined} alt="Sin fondo" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fondo del resultado</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="bgMode" checked={mode === "transparent"} onChange={() => setMode("transparent")} />
                    Transparente
                  </label>
                  {accentColor ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="bgMode" checked={mode === "brand"} onChange={() => setMode("brand")} />
                      Color de tu marca
                      <span className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: accentColor }} aria-hidden />
                    </label>
                  ) : null}
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="bgMode" checked={mode === "custom-color"} onChange={() => setMode("custom-color")} />
                    Otro color
                    {mode === "custom-color" ? (
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="h-6 w-10 cursor-pointer rounded border border-border-strong bg-transparent p-0.5"
                        aria-label="Elegir color de fondo"
                      />
                    ) : null}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="bgMode" checked={mode === "custom-image"} onChange={() => setMode("custom-image")} />
                    Imagen de fondo
                    {mode === "custom-image" ? (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(e) => setCustomImage(e.target.files?.[0] ?? null)}
                        className="text-xs file:mr-2 file:rounded-control file:border-0 file:bg-accent file:px-2 file:py-1 file:text-xs file:font-semibold file:uppercase file:text-accent-foreground"
                      />
                    ) : null}
                  </label>
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
