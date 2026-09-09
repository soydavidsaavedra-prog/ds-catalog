import { createClient } from "@supabase/supabase-js";

/**
 * Raw service-role client for E2E setup/teardown — deliberately NOT
 * importing from lib/repositories/* or lib/db/supabaseClient.ts, both of
 * which are "server-only"-marked. That guard throws unconditionally
 * outside Next.js's own build (see lib/repositories/storage-repository.ts
 * and vitest.config.ts's alias workaround for the same issue under
 * Vitest) — global-setup/teardown run as plain Node scripts under
 * Playwright, not inside a Next.js request, so this mirrors the same
 * raw-client pattern scripts/seed-demo-tenant.ts already uses for the
 * same reason.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Set it in .env.local before running the E2E suite (npm run test:e2e).`);
  }
  return value;
}

export function createSupabaseAdminClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
