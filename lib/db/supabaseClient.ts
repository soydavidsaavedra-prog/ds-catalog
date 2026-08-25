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

let cachedAuthClient: SupabaseClient<Database> | null = null;

/**
 * Second client, keyed with the project's anon key instead of
 * service_role — used exclusively for lib/auth/supabase-auth.ts's Auth
 * calls (signInWithPassword, resetPasswordForEmail, getUser). Those are
 * password/session operations, not table access, so the anon key is the
 * correct credential for them (the service_role key is reserved for
 * admin.* calls, which require it by design).
 *
 * Deliberately named SUPABASE_ANON_KEY, not NEXT_PUBLIC_SUPABASE_ANON_KEY:
 * this client is only ever imported from "server-only" files, and this
 * project's whole security model is "no Supabase credential of any kind
 * reaches the browser" (see docs/ARCHITECTURE.md) — a NEXT_PUBLIC_ name
 * here would invite a future client component to import it directly.
 */
export function getSupabaseAuthClient(): SupabaseClient<Database> {
  if (cachedAuthClient) return cachedAuthClient;

  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getEnv("SUPABASE_ANON_KEY");

  cachedAuthClient = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedAuthClient;
}
