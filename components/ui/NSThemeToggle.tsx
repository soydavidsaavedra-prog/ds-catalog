"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Mode = "light" | "dark";

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Whatever the page is actually showing right now — an explicit choice (documentElement[data-theme], set synchronously by the blocking script in app/layout.tsx) or, absent one, the OS/browser preference. */
function currentMode(): Mode {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return systemPrefersDark() ? "dark" : "light";
}

/** Renders nothing meaningful until mounted — the real mode depends on localStorage/matchMedia, neither available during SSR, so guessing here would flash/mismatch on hydration. app/layout.tsx's blocking script already applies the right attribute before first paint; this hook just needs a moment to read it back. */
function useThemeMode() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    setMode(currentMode());
  }, []);

  function toggle() {
    setMode((prev) => {
      const next: Mode = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("ds-theme", next);
      } catch {
        // Storage disabled/unavailable (private browsing, blocked cookies) — the
        // toggle still works for this page load, it just won't persist.
      }
      return next;
    });
  }

  return { mode, toggle };
}

/**
 * A single light/dark toggle, usable anywhere (storefront header, admin
 * sidebar, Super Admin sidebar) — every surface's CSS already reacts to
 * documentElement[data-theme] (see app/globals.css's :root/.ds-platform
 * blocks), so this component only ever needs to flip that one attribute
 * plus persist the choice; it never needs to know which surface it's on.
 * Exceptions that stay fixed regardless of this toggle, by design: Theme
 * 02's own dark identity (its whole visual premise, like .ds-platform's
 * default) and .tenant-preview (always shows the tenant's real light
 * look) — neither renders this component.
 *
 * `variant="icon"` (default) is a compact square button for a header's
 * icon row. `variant="row"` is a full-width labeled row matching a
 * sidebar's other menu items (see NSAdminSidebar/NSSuperAdminSidebar).
 */
export function NSThemeToggle({ className, variant = "icon" }: { className?: string; variant?: "icon" | "row" }) {
  const { mode, toggle } = useThemeMode();

  if (mode === null) {
    return variant === "row" ? (
      <span aria-hidden className={cn("block h-9", className)} />
    ) : (
      <span aria-hidden className={cn("inline-block h-10 w-10", className)} />
    );
  }

  const label = mode === "dark" ? "Modo claro" : "Modo oscuro";
  const Icon = mode === "dark" ? SunIcon : MoonIcon;

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-control px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
          className,
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-control text-foreground transition-colors hover:bg-surface",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="3.5" />
      <path
        strokeLinecap="round"
        d="M10 2.5v1.8M10 15.7v1.8M17.5 10h-1.8M4.3 10H2.5M15.1 4.9l-1.3 1.3M6.2 13.8l-1.3 1.3M15.1 15.1l-1.3-1.3M6.2 6.2 4.9 4.9"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 12.8A7.2 7.2 0 0 1 7.2 3a7.2 7.2 0 1 0 9.8 9.8Z" />
    </svg>
  );
}
