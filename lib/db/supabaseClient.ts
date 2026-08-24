import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase-types";

/**
 * Server-only Supabase client, authenticated with the service_role key so
 * it bypasses RLS entirely. This mirrors how the previous JSON file store
 * worked: every repository is a server-only module, nothing here is ever
 * imported into a client component, and the service_role key never reaches
 * the browser. See supabase/schema.sql for the tables this talks to.
 */

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in your environment (.env.local locally, Project Settings → Environment Variables on Vercel).`,
    );
  }
  return value;
}

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;

  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}
