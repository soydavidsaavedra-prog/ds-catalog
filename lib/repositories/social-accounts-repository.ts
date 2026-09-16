import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SocialAccountRow } from "@/lib/db/supabase-types";
import type { SocialAccount, SocialAccountStatus, SocialPlatform } from "@/lib/types/social";

export type SocialAccountInput = Omit<SocialAccount, "id" | "tenantId" | "createdAt" | "updatedAt">;

function fromRow(row: SocialAccountRow): SocialAccount {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    platform: row.platform,
    externalAccountId: row.external_account_id,
    displayName: row.display_name,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenExpiresAt: row.token_expires_at,
    scopes: row.scopes,
    connectedBy: row.connected_by,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listSocialAccounts(tenantId: string): Promise<SocialAccount[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_accounts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as SocialAccountRow[]).map(fromRow);
}

export async function getSocialAccountById(tenantId: string, id: string): Promise<SocialAccount | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_accounts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as SocialAccountRow) : null;
}

/** Upsert by (tenant, platform, external account id) — reconnecting the same page/profile refreshes its tokens instead of creating a duplicate row. */
export async function upsertSocialAccount(
  tenantId: string,
  input: SocialAccountInput,
): Promise<SocialAccount> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_accounts")
    .upsert(
      {
        tenant_id: tenantId,
        platform: input.platform,
        external_account_id: input.externalAccountId,
        display_name: input.displayName,
        access_token: input.accessToken,
        refresh_token: input.refreshToken,
        token_expires_at: input.tokenExpiresAt,
        scopes: input.scopes,
        connected_by: input.connectedBy,
        status: input.status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,platform,external_account_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as SocialAccountRow);
}

export async function updateSocialAccountStatus(
  tenantId: string,
  id: string,
  status: SocialAccountStatus,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ds_social_accounts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSocialAccount(tenantId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_social_accounts").delete().eq("tenant_id", tenantId).eq("id", id);
  if (error) throw error;
}

/**
 * Looks up an account by platform + the id the platform itself uses
 * (Page id, IG business id, TikTok open_id) — not tenant-scoped, because
 * an inbound webhook identifies the Page/account, never the tenant.
 * Used by app/api/social/webhooks/meta/route.ts to figure out which
 * tenant a given webhook event belongs to.
 */
export async function getSocialAccountByExternalId(
  platform: SocialPlatform,
  externalAccountId: string,
): Promise<SocialAccount | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_accounts")
    .select("*")
    .eq("platform", platform)
    .eq("external_account_id", externalAccountId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as SocialAccountRow) : null;
}

export async function listSocialAccountsByPlatform(
  tenantId: string,
  platform: SocialPlatform,
): Promise<SocialAccount[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_accounts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("platform", platform)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as SocialAccountRow[]).map(fromRow);
}
