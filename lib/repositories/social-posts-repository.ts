import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SocialPostRow } from "@/lib/db/supabase-types";
import type { SocialPost, SocialPostStatus } from "@/lib/types/social";

export type SocialPostInput = {
  accountId: string;
  platform: SocialPost["platform"];
  content: string;
  mediaUrls: string[];
  scheduledAt: string | null;
  createdBy: string;
};

function fromRow(row: SocialPostRow): SocialPost {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    accountId: row.account_id,
    platform: row.platform,
    content: row.content,
    mediaUrls: row.media_urls,
    status: row.status,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    externalPostId: row.external_post_id,
    errorMessage: row.error_message,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listSocialPosts(tenantId: string): Promise<SocialPost[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_posts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as SocialPostRow[]).map(fromRow);
}

export async function getSocialPostById(tenantId: string, id: string): Promise<SocialPost | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_posts")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as SocialPostRow) : null;
}

export async function createSocialPost(tenantId: string, input: SocialPostInput): Promise<SocialPost> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_posts")
    .insert({
      tenant_id: tenantId,
      account_id: input.accountId,
      platform: input.platform,
      content: input.content,
      media_urls: input.mediaUrls,
      status: input.scheduledAt ? "scheduled" : "draft",
      scheduled_at: input.scheduledAt,
      created_by: input.createdBy,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as SocialPostRow);
}

export async function deleteSocialPost(tenantId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ds_social_posts")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .in("status", ["draft", "scheduled", "failed"]);
  if (error) throw error;
}

/** Looks up a post's row id by the id TikTok's publish-status webhook reports back — see app/api/social/webhooks/tiktok/route.ts. */
export async function findSocialPostIdByExternalId(externalPostId: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_posts")
    .select("id")
    .eq("external_post_id", externalPostId)
    .maybeSingle();
  if (error) throw error;
  return (data as { id: string } | null)?.id ?? null;
}

/** Every post whose scheduled_at has arrived and hasn't been published yet — read by the publish cron across all tenants, so it deliberately isn't tenant-scoped. */
export async function listDueSocialPosts(now: Date): Promise<SocialPost[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_posts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", now.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(25);
  if (error) throw error;
  return (data as SocialPostRow[]).map(fromRow);
}

export async function markSocialPostStatus(
  id: string,
  status: SocialPostStatus,
  patch?: { externalPostId?: string | null; errorMessage?: string | null; publishedAt?: string | null },
): Promise<void> {
  const supabase = getSupabaseClient();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (patch && "externalPostId" in patch) update.external_post_id = patch.externalPostId;
  if (patch && "errorMessage" in patch) update.error_message = patch.errorMessage;
  if (patch && "publishedAt" in patch) update.published_at = patch.publishedAt;

  const { error } = await supabase.from("ds_social_posts").update(update).eq("id", id);
  if (error) throw error;
}
