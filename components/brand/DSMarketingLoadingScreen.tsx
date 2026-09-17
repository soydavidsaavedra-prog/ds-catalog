import { DSPlatformMark } from "@/components/brand/DSPlatformMark";

/**
 * Enhanced loading state for the platform's public/marketing entry points
 * (root landing, /acceder, /registro, /terminos, /privacidad — see
 * app/loading.tsx). Everything else (tenant storefront + admin, Super
 * Admin) keeps the plain `DSLoadingScreen` via their own
 * app/[tenant]/loading.tsx and app/superadmin/loading.tsx boundaries, so
 * this richer treatment never reaches the dashboards.
 *
 * Wraps itself in `.ds-landing-dark` directly (rather than relying on an
 * ancestor scope) because a loading.tsx boundary renders *before* the
 * actual page — and that page's own scope wrapper — has mounted; there's
 * nothing to inherit from yet. Pure CSS, no "use client"/motion, same
 * rationale as `DSLoadingScreen`: it must render with zero JS before
 * hydration. The global `@media (prefers-reduced-motion: reduce)` rule at
 * the bottom of globals.css already forces every animation here to a
 * single near-instant frame, so no extra reduced-motion code is needed.
 */
export function DSMarketingLoadingScreen() {
  return (
    <div
      className="ds-landing-dark flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4"
      role="status"
      aria-label="Cargando"
    >
      <DSPlatformMark className="h-16 w-16 animate-logo-pulse" />
      <p className="ds-text-shine font-display text-sm uppercase tracking-[0.3em]">Cargando tu catálogo…</p>
      <div className="h-1 w-40 overflow-hidden rounded-pill bg-surface">
        <div className="h-full w-1/3 animate-loading-sweep rounded-pill bg-accent" />
      </div>
    </div>
  );
}
