"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * A single, auto-dismissing confirmation toast — bottom-center, fixed
 * ink-950/ink-0 pairing (not semantic tokens) so it reads correctly
 * regardless of the surrounding page's light/dark state, the same
 * reasoning as .ds-landing-dark in app/globals.css: raw colors that are
 * always paired together are safe where a semantic token could mismatch.
 *
 * No queue — pass a `trigger` value that changes (e.g. a counter) each
 * time the toast should (re)appear, since two identical `message`s in a
 * row wouldn't otherwise re-trigger the show animation.
 */
export function NSToast({
  message,
  trigger,
  durationMs = 2200,
}: {
  message: string;
  trigger: number;
  durationMs?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timer);
  }, [trigger, durationMs]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-pill bg-ink-950 px-5 py-3 text-sm font-medium text-ink-0 shadow-modal transition-all duration-300",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4 10.5 4 4 8-9" />
        </svg>
        {message}
      </div>
    </div>
  );
}
