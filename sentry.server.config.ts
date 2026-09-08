import * as Sentry from "@sentry/nextjs";

/**
 * Server-side (Node runtime) init — loaded by instrumentation.ts's
 * register() only when NEXT_RUNTIME === "nodejs". Catches every server
 * component/action/route-handler exception, the exact kind of crash
 * behind the "Application error: a server-side exception has occurred...
 * Digest: ..." pages this was built to stop being a dead end.
 *
 * NEXT_PUBLIC_SENTRY_DSN unset (the default until someone configures it)
 * makes Sentry.init() a safe no-op — nothing is sent anywhere, no error is
 * thrown. See README.md's "Variables de entorno" for how to turn this on.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  // Keep sampling low — this traces every server request, and the free
  // Sentry tier's quota is better spent on errors than on tracing a small
  // app's normal traffic.
  tracesSampleRate: 0.1,
});
