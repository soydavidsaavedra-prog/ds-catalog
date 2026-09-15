import { DSPlatformMark } from "@/components/brand/DSPlatformMark";

/**
 * Full-viewport loading state shown by Next.js's loading.tsx boundaries
 * while a Server Component segment is fetching data (see app/loading.tsx).
 * Platform-generic on purpose — DSPlatformMark, not NSLogo — since a
 * route's tenant/theme isn't resolved yet at this point in the render.
 * The pulse (globals.css: --animate-logo-pulse) is pure CSS so it runs
 * with zero JS before hydration; motion-reduce turns it into a plain
 * static mark for anyone who's asked for less motion.
 */
export function DSLoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4" role="status" aria-label="Cargando">
      <DSPlatformMark className="h-16 w-16 animate-logo-pulse motion-reduce:animate-none" />
      <div className="flex flex-col items-center gap-2">
        <div className="h-3 w-32 animate-pulse rounded bg-surface motion-reduce:animate-none" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-surface motion-reduce:animate-none" />
      </div>
    </div>
  );
}
