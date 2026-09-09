import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { cleanupTestFixtures } from "./cleanup";
import { createSupabaseAdminClient } from "./supabase-admin";

export default async function globalTeardown(): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await cleanupTestFixtures(supabase);
}
