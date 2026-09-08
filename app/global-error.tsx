"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Catches an error thrown by the ROOT layout itself (app/layout.tsx) —
 * much rarer than app/error.tsx's case (a crash below it), but when it
 * happens app/error.tsx can't run either, since the layout that would
 * render it is what's broken. Next.js requires this file to render its
 * own complete <html>/<body> — the real root layout, its fonts, and
 * globals.css are exactly what may have failed, so this stays
 * intentionally free of every other import in the app (including its own
 * design system) to minimize the chance the fallback itself fails too.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a09",
          color: "#f5f5f4",
        }}
      >
        <p style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.02em", textTransform: "uppercase" }}>
          Algo salió mal
        </p>
        <p style={{ maxWidth: 420, fontSize: "0.875rem", color: "#a8a29e" }}>
          Ocurrió un error inesperado al cargar la plataforma. Ya quedó registrado.
        </p>
        {error.digest ? <p style={{ fontSize: "0.75rem", color: "#a8a29e" }}>Código: {error.digest}</p> : null}
        <button
          onClick={() => window.location.assign("/")}
          style={{
            marginTop: "0.5rem",
            height: "2.75rem",
            padding: "0 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#f5f5f4",
            color: "#0a0a09",
            fontSize: "0.875rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            cursor: "pointer",
          }}
        >
          Volver al inicio
        </button>
      </body>
    </html>
  );
}
