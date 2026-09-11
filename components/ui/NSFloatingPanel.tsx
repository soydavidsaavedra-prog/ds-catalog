"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type PanelState = "normal" | "minimized" | "maximized";

/**
 * Lets a child deep inside `children` (NSProductForm's own "Cancelar"
 * button) trigger the exact same dismissal as the panel's own × — see the
 * comment on handleDismiss below for why this can't just be a Link/push.
 */
const NSFloatingPanelDismissContext = createContext<(() => void) | null>(null);

/** Reads the current panel's dismiss handler, or null when not rendered inside one (e.g. the edit-product page, which has no floating panel). */
export function useNSFloatingPanelDismiss() {
  return useContext(NSFloatingPanelDismissContext);
}

/**
 * Window chrome (minimize/maximize/close) around a form that used to be
 * just a plain full-page route — for a tenant who opened "Nuevo producto"
 * by mistake, or wants to park it half-filled and go do something else in
 * the dashboard without losing what they've typed.
 *
 * Rendered from productos/@modal/(.)nuevo (an intercepted route), the
 * products list stays mounted behind this panel the whole time — "normal"
 * and "maximized" sit on top of it as a dialog (with a dimming backdrop,
 * so the list isn't accidentally clicked through); "minimized" drops the
 * backdrop entirely and shrinks to a small corner card, so the list is
 * fully visible and editable again while the form waits.
 *
 * `children` stays mounted in the DOM in every state — minimizing hides it
 * with `hidden` (not a conditional `{state !== "minimized" && ...}`),
 * so whatever the tenant already typed into the form survives.
 */
export function NSFloatingPanel({
  title,
  closeHref,
  children,
}: {
  title: string;
  /** Where "Cerrar" (×) ends up — used only as a fallback when there's no history entry to go back to (e.g. a hard reload landed straight on this URL). */
  closeHref: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<PanelState>("normal");

  // This panel is normally reached via an *intercepted* route
  // (productos/@modal/(.)nuevo), which keeps the products list mounted
  // behind it. Dismissing with router.push(closeHref) doesn't work there:
  // on a client-side transition, Next.js keeps a parallel-route slot's
  // last active state when the target URL doesn't include that slot,
  // so the modal never collapses back to its default.tsx — the × and
  // "Cancelar" would silently do nothing. router.back() pops the actual
  // history entry instead, which Next resolves correctly. Only fall back
  // to push when there's truly nothing to go back to (a hard reload / a
  // fresh tab landed directly on the standalone /productos/nuevo route).
  function handleDismiss() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(closeHref);
    }
  }

  return (
    <NSFloatingPanelDismissContext.Provider value={handleDismiss}>
      {state !== "minimized" ? <div className="fixed inset-0 z-40 bg-[var(--overlay)]" aria-hidden /> : null}

      <div
        className={cn(
          "fixed z-50 flex flex-col rounded-card border border-border bg-surface-elevated shadow-modal",
          state === "normal" ? "inset-4 sm:inset-x-0 sm:inset-y-10 sm:mx-auto sm:w-full sm:max-w-2xl" : "",
          state === "maximized" ? "inset-4 sm:inset-10" : "",
          state === "minimized" ? "bottom-4 right-4 w-64" : "",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 rounded-t-card border-b border-border bg-surface px-4 py-3">
          <p className="truncate text-sm font-semibold uppercase tracking-wide text-foreground">{title}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setState((s) => (s === "minimized" ? "normal" : "minimized"))}
              aria-label={state === "minimized" ? "Restaurar" : "Minimizar"}
              title={state === "minimized" ? "Restaurar" : "Minimizar"}
              className="flex h-7 w-7 items-center justify-center rounded-control text-muted-foreground hover:bg-border/40 hover:text-foreground"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path strokeLinecap="round" d="M5 15h10" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setState((s) => (s === "maximized" ? "normal" : "maximized"))}
              aria-label={state === "maximized" ? "Restaurar" : "Maximizar"}
              title={state === "maximized" ? "Restaurar" : "Maximizar"}
              className="flex h-7 w-7 items-center justify-center rounded-control text-muted-foreground hover:bg-border/40 hover:text-foreground"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <rect x="4.5" y="4.5" width="11" height="11" rx="1.2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Cerrar"
              title="Cerrar"
              className="flex h-7 w-7 items-center justify-center rounded-control text-muted-foreground hover:bg-danger/10 hover:text-danger"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
        </div>

        <div hidden={state === "minimized"} className="min-h-0 flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </NSFloatingPanelDismissContext.Provider>
  );
}
