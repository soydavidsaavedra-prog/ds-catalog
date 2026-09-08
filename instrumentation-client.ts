import * as Sentry from "@sentry/nextjs";

/**
 * Client-side (browser) init. Next.js auto-loads this file with Turbopack
 * (the older sentry.client.config.ts pattern doesn't work under
 * `--turbopack`, which this project uses for both dev and build — see
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client).
 * Covers storefront, tenant admin, and Super Admin alike — there's no
 * per-surface split, same as everything else in app/layout.tsx.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
