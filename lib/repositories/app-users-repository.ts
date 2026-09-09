import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { AppUserRole, AppUserRow } from "@/lib/db/supabase-types";

export interface AppUser {
  id: string;
  email: string;
  role: AppUserRole;
  tenantId: string | null;
}

function fromRow(row: AppUserRow): AppUser {
  return { id: row.id, email: row.email, role: row.role, tenantId: row.tenant_id };
}

export async function getAppUserById(id: string): Promise<AppUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ds_app_users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as AppUserRow) : null;
}

export async function getAppUserByEmail(email: string): Promise<AppUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_app_users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as AppUserRow) : null;
}

export async function isAppUserEmailTaken(email: string): Promise<boolean> {
  return (await getAppUserByEmail(email)) !== null;
}

export interface CreateAppUserInput {
  id: string;
  email: string;
  role: AppUserRole;
  tenantId: string | null;
}

export async function createAppUser(input: CreateAppUserInput): Promise<AppUser> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_app_users")
    .insert({ id: input.id, email: input.email.toLowerCase().trim(), role: input.role, tenant_id: input.tenantId })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as AppUserRow);
}

/** /admin/cuenta's "cambiar correo de inicio de sesión" — caller updates the Supabase Auth user's email first (lib/auth/supabase-auth.ts updateAuthUserEmail), this just keeps the profile row in sync. */
export async function updateAppUserEmail(id: string, email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_app_users").update({ email: email.toLowerCase().trim() }).eq("id", id);
  if (error) throw error;
}

/** Super Admin invite flow only — one owner profile per tenant, so replacing an existing one (rare: re-inviting after a mistyped email) means deleting the old row first. */
export async function deleteAppUserByTenantId(tenantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_app_users").delete().eq("tenant_id", tenantId);
  if (error) throw error;
}

export async function getAppUserByTenantId(tenantId: string): Promise<AppUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_app_users")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as AppUserRow) : null;
}
