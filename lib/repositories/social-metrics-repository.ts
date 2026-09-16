import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SocialMetricsSnapshotRow } from "@/lib/db/supabase-types";
import type { SocialMetricsSnapshot, SocialPlatform } from "@/lib/types/social";

function fromRow(row: SocialMetricsSnapshotRow): SocialMetricsSnapshot {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    accountId: row.account_id,
    platform: row.platform,
    capturedAt: row.captured_at,
    followersCount: row.followers_count,
    engagementCount: row.engagement_count,
    impressionsCount: row.impressions_count,
    raw: row.raw,
  };
}

export async function recordMetricsSnapshot(
  tenantId: string,
  input: {
    accountId: string;
    platform: SocialPlatform;
    followersCount: number | null;
    engagementCount: number | null;
    impressionsCount: number | null;
    raw: Record<string, unknown> | null;
  },
): Promise<SocialMetricsSnapshot> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_metrics_snapshots")
    .insert({
      tenant_id: tenantId,
      account_id: input.accountId,
      platform: input.platform,
      followers_count: input.followersCount,
      engagement_count: input.engagementCount,
      impressions_count: input.impressionsCount,
      raw: input.raw,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as SocialMetricsSnapshotRow);
}

/** Latest snapshot per account, for the dashboard's current-stats cards. */
export async function getLatestSnapshotByAccount(accountId: string): Promise<SocialMetricsSnapshot | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_metrics_snapshots")
    .select("*")
    .eq("account_id", accountId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as SocialMetricsSnapshotRow) : null;
}

export async function listSnapshotHistory(accountId: string, limit = 30): Promise<SocialMetricsSnapshot[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_metrics_snapshots")
    .select("*")
    .eq("account_id", accountId)
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as SocialMetricsSnapshotRow[]).map(fromRow);
}
