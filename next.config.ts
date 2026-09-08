import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Product photos uploaded via /admin/api/upload live in Supabase Storage
// (public bucket "ns-product-images") and are rendered through next/image,
// which requires the remote host to be explicitly allowlisted.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

/**
 * Wraps the build with Sentry's Next.js plugin — mainly for source map
 * upload (readable stack traces instead of minified ones in the Sentry
 * dashboard), which needs org/project/authToken. Building with
 * `--turbopack` (this project's build script) already makes most of the
 * plugin's webpack-time instrumentation a no-op per Sentry's own docs;
 * runtime error capture (instrumentation.ts, instrumentation-client.ts)
 * works the same regardless. Without SENTRY_AUTH_TOKEN set, the plugin
 * just skips the upload step rather than failing the build — safe to keep
 * this wrapper in place before that variable is ever configured.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
});
