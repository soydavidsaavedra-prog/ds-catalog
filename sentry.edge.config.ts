import * as Sentry from "@sentry/nextjs";

/**
 * Edge runtime init — loaded by instrumentation.ts's register() only when
 * NEXT_RUNTIME === "edge" (middleware.ts, which always runs on the Edge
 * runtime). Same DSN/no-op-when-unset behavior as sentry.server.config.ts.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
