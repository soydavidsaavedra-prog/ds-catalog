"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { NSLogo } from "@/components/brand/NSLogo";
import { NSButton } from "@/components/ui/NSButton";
import { RESERVED_SLUGS } from "@/lib/utils/reserved-slugs";

/**
 * Where "Volver al inicio" below should land, derived from the URL the
 * error happened on — never the platform's own root "/". Without this, a
 * tenant admin who hits an error deep in /{tenant}/admin/... got dumped on
 * the generic DS Catalog marketing page with no obvious way back into
 * their own catalog, which reads as "my session got logged out" (they
 * have to go through /acceder again to get back in) even though the
 * session cookie was never touched.
 */
function homeHrefFor(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first) return "/";
  if (first === "superadmin") return "/superadmin";
  if (RESERVED_SLUGS.has(first)) return "/";
  return segments[1] === "admin" ? `/${first}/admin` : `/${first}`;
}

/**
 * Catches any otherwise-uncaught error thrown while rendering a route
 * segment below the root layout — storefront pages, admin pages, Super
 * Admin pages alike, since none of them define their own error.tsx.
 * Without this, a crash here used to fall through to Next.js's bare
 * "Application error: a server-side exception has occurred... Digest:
 * ..." page (see the two production crashes reported earlier this
 * project). Reports to Sentry (instrumentation.ts's onRequestError
 * already reports the server-side half of this same error independently;
 * capturing it again here is what attaches the browser-side context —
 * URL, breadcrumbs — Sentry can't get from the server alone) and offers a
 * real way out instead of a dead end.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const homeHref = homeHrefFor(pathname);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href={homeHref} aria-label="Inicio">
          <NSLogo id="ds-error" variant="mark" className="h-10 w-10" />
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="font-display text-3xl uppercase tracking-wide">Algo salió mal</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Ocurrió un error inesperado. Ya quedó registrado — puedes intentarlo de nuevo o volver al inicio.
        </p>
        {error.digest ? <p className="text-xs text-muted-foreground">Código: {error.digest}</p> : null}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <NSButton onClick={reset} variant="primary" size="md">
            Reintentar
          </NSButton>
          <NSButton href={homeHref} variant="outline" size="md">
            Volver al inicio
          </NSButton>
        </div>
      </div>
    </div>
  );
}
