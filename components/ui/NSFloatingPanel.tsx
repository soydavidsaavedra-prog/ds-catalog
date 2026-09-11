"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type PanelState = "normal" | "minimized" | "maximized";

/**
 * Window chrome (minimize/maximize/close) around a form that used to be
 * just a plain full-page route — for a tenant who opened "Nuevo producto"
 * by mistake, or wants to park it half-filled and go do something else in
 * the dashboard without losing what they've typed. The sidebar/shell this
 * sits inside (see the (shell) route group) was already visible on this
 * page before this component existed; what it adds is the ability to
 * shrink out of the way or expand, instead of only "leave the page
 * entirely" vs. "full content-area form".
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
  /** Where "Cerrar" (×) navigates — discarding the form, same as a Cancel button. */
  closeHref: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<PanelState>("normal");

  return (
    <>
      {state === "maximized" ? (
        <div className="fixed inset-0 z-40 bg-[var(--overlay)]" aria-hidden onClick={() => setState("normal")} />
      ) : null}

      <div
        className={cn(
          "flex flex-col rounded-card border border-border bg-surface-elevated shadow-modal",
          state === "maximized" ? "fixed inset-4 z-50 sm:inset-10" : "",
          state === "minimized" ? "fixed bottom-4 right-4 z-50 w-64" : "",
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
              onClick={() => router.push(closeHref)}
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

        <div hidden={state === "minimized"} className={cn("min-h-0 flex-1 overflow-y-auto p-5", state === "maximized" ? "" : "")}>
          {children}
        </div>
      </div>
    </>
  );
}
