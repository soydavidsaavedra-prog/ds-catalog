"use client";

import { useEffect, useRef, useState } from "react";
import { NSButton } from "@/components/ui/NSButton";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";

type Phase = "processing" | "success" | "error";

/**
 * Opens already processing (same UX as NSBackgroundRemovalDialog: click the
 * trigger -> immediately "Analizando..." -> review/accept or cancel).
 * Never applies the suggestion on its own — onAccept only fires when the
 * tenant explicitly clicks "Usar sugerencia", after reviewing/editing it,
 * same "never silently mutate" rule as the background-removal dialog.
 *
 * Always calls the server route — the server itself picks the engine
 * (Claude if ANTHROPIC_API_KEY is set, else the free Gemini fallback if
 * GEMINI_API_KEY is set; see app/[tenant]/admin/api/analyze-product/route.ts),
 * so this component doesn't need to know or care which one answered.
 */
export function NSProductAiAssistDialog({
  tenantSlug,
  imageUrl,
  onAccept,
  onCancel,
}: {
  tenantSlug: string;
  imageUrl: string;
  onAccept: (name: string, description: string) => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("processing");
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const nameRef = useRef(name);
  const descriptionRef = useRef(description);
  nameRef.current = name;
  descriptionRef.current = description;

  useEffect(() => {
    let cancelled = false;
    setPhase("processing");
    setErrorReason(null);

    (async () => {
      try {
        const res = await fetch(`/${tenantSlug}/admin/api/analyze-product`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data) {
          setErrorReason(data?.error ?? null);
          setPhase("error");
          return;
        }
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setPhase("success");
      } catch {
        if (!cancelled) {
          setErrorReason(null);
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantSlug, imageUrl]);

  function handleAccept() {
    onAccept(nameRef.current, descriptionRef.current);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[var(--overlay)]" onClick={onCancel} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Sugerir con IA">
        <div
          className="w-full max-w-lg rounded-card border border-border bg-surface-elevated p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-display text-lg uppercase tracking-wide">Sugerir con IA</h2>

          {phase === "processing" ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <span
                className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">Analizando la foto...</p>
            </div>
          ) : phase === "error" ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="max-w-xs text-sm text-danger">
                {errorReason === "not_configured"
                  ? "La función de IA no está configurada en este panel."
                  : "No pudimos analizar la imagen. Intenta de nuevo."}
              </p>
              <NSButton variant="outline" size="sm" onClick={onCancel}>
                Cerrar
              </NSButton>
            </div>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                Sugerencia generada por IA a partir de la foto principal — revísala y ajústala antes de usarla.
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <NSLabel htmlFor="ai-name">Nombre sugerido</NSLabel>
                  <NSInput id="ai-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <NSLabel htmlFor="ai-description">Descripción sugerida</NSLabel>
                  <NSTextarea
                    id="ai-description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <NSButton onClick={handleAccept}>Usar sugerencia</NSButton>
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
