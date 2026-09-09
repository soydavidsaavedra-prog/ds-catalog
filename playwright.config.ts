import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

/**
 * E2E suite — see e2e/setup/global-setup.ts for the fixtures every spec
 * logs into (one tenant + owner, one disposable Super Admin test
 * account). Requires real Supabase credentials in .env.local (the same
 * ones `npm run dev` already needs) — there is no mocked-backend mode,
 * since the whole point is exercising the real login/2FA/rate-limit/
 * import flows against the real database, not a stand-in for it.
 *
 * `workers: 1` and `fullyParallel: false`: every spec shares the SAME
 * seeded tenant/Super Admin account rather than each getting its own, so
 * two specs mutating that account's session/2FA state concurrently would
 * race each other.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  globalSetup: "./e2e/setup/global-setup.ts",
  globalTeardown: "./e2e/setup/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
