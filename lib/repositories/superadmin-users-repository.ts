import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SuperAdminUserRow } from "@/lib/db/supabase-types";

export interface SuperAdminUser {
  id: string;
  email: string;
  active: boolean;
}

function fromRow(row: SuperAdminUserRow): SuperAdminUser {
  return { id: row.id, email: row.email, active: row.active };
}

/** Auth-only lookup — includes the password hash, never returned outside lib/auth/superadmin-auth.ts. */
export async function getSuperAdminAuthRecordByEmail(
  email: string,
): Promise<{ id: string; email: string; passwordHash: string; active: boolean } | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("super_admin_users")
    .select("id, email, password_hash, active")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, email: data.email, passwordHash: data.password_hash, active: data.active };
}

export async function getSuperAdminById(id: string): Promise<SuperAdminUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("super_admin_users")
    .select("id, email, active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as SuperAdminUserRow) : null;
}

export async function createSuperAdminUser(email: string, passwordHash: string): Promise<SuperAdminUser> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("super_admin_users")
    .insert({ email: email.toLowerCase().trim(), password_hash: passwordHash })
    .select("id, email, active")
    .single();
  if (error) throw error;
  return fromRow(data as SuperAdminUserRow);
}
