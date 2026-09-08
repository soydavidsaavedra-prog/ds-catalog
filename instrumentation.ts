import * as Sentry from "@sentry/nextjs";

/**
 * Next.js's own instrumentation hook (not Sentry-specific — see
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation),
 * run once per runtime instance before any other code. Loads the matching
 * Sentry init file for whichever runtime this process actually is —
 * Node.js (server components, actions, route handlers) or Edge
 * (middleware.ts) — so each only pulls in the SDK bits that runtime
 * supports.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Next.js 15's unified error hook — fires for every uncaught error thrown
 * during a server render, Server Action, or route handler, regardless of
 * whether an app/error.tsx boundary also catches it for the user-facing
 * fallback. This is what actually reports the crashes behind the
 * "Application error... Digest: ..." pages tenants and Super Admin have
 * hit — captureRequestError attaches the same digest Sentry receives, so
 * a reported digest can be matched straight to its Sentry event.
 */
export const onRequestError = Sentry.captureRequestError;
