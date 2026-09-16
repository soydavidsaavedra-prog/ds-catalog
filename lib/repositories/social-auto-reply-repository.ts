import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SocialAutoReplyRuleRow, SocialEventRow } from "@/lib/db/supabase-types";
import type { SocialAutoReplyRule, SocialEvent, SocialPlatform, SocialTriggerType } from "@/lib/types/social";

export type SocialAutoReplyRuleInput = {
  accountId: string;
  platform: SocialPlatform;
  triggerType: SocialTriggerType;
  keywords: string[];
  replyTemplate: string;
  active: boolean;
};

function ruleFromRow(row: SocialAutoReplyRuleRow): SocialAutoReplyRule {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    accountId: row.account_id,
    platform: row.platform,
    triggerType: row.trigger_type,
    keywords: row.keywords,
    replyTemplate: row.reply_template,
    active: row.active,
    createdAt: row.created_at,
  };
}

function eventFromRow(row: SocialEventRow): SocialEvent {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    accountId: row.account_id,
    platform: row.platform,
    eventType: row.event_type,
    externalEventId: row.external_event_id,
    senderName: row.sender_name,
    messageText: row.message_text,
    matchedRuleId: row.matched_rule_id,
    replied: row.replied,
    replyText: row.reply_text,
    replyError: row.reply_error,
    createdAt: row.created_at,
  };
}

export async function listAutoReplyRules(tenantId: string): Promise<SocialAutoReplyRule[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_auto_reply_rules")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as SocialAutoReplyRuleRow[]).map(ruleFromRow);
}

/** Active rules for one account, read by the auto-reply engine when an incoming comment/DM webhook fires. */
export async function listActiveRulesForAccount(
  accountId: string,
  triggerType: SocialTriggerType,
): Promise<SocialAutoReplyRule[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_auto_reply_rules")
    .select("*")
    .eq("account_id", accountId)
    .eq("trigger_type", triggerType)
    .eq("active", true);
  if (error) throw error;
  return (data as SocialAutoReplyRuleRow[]).map(ruleFromRow);
}

export async function createAutoReplyRule(
  tenantId: string,
  input: SocialAutoReplyRuleInput,
): Promise<SocialAutoReplyRule> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_auto_reply_rules")
    .insert({
      tenant_id: tenantId,
      account_id: input.accountId,
      platform: input.platform,
      trigger_type: input.triggerType,
      keywords: input.keywords,
      reply_template: input.replyTemplate,
      active: input.active,
    })
    .select("*")
    .single();
  if (error) throw error;
  return ruleFromRow(data as SocialAutoReplyRuleRow);
}

export async function setAutoReplyRuleActive(tenantId: string, id: string, active: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ds_social_auto_reply_rules")
    .update({ active })
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAutoReplyRule(tenantId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_social_auto_reply_rules").delete().eq("tenant_id", tenantId).eq("id", id);
  if (error) throw error;
}

export async function listRecentSocialEvents(tenantId: string, limit = 50): Promise<SocialEvent[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_events")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as SocialEventRow[]).map(eventFromRow);
}

export type SocialEventInput = {
  accountId: string;
  platform: SocialPlatform;
  eventType: SocialTriggerType;
  externalEventId: string;
  senderName: string;
  messageText: string;
};

/**
 * Records an incoming comment/DM. Idempotent on (tenant, platform,
 * external_event_id) — Meta/TikTok webhooks are "at least once", so the
 * same event can arrive more than once; a retried delivery must not fire
 * the auto-reply twice. Returns null when the event was already recorded
 * (a retry), so the caller knows to skip matching/replying again.
 */
export async function recordSocialEventIfNew(
  tenantId: string,
  input: SocialEventInput,
): Promise<SocialEvent | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_social_events")
    .insert({
      tenant_id: tenantId,
      account_id: input.accountId,
      platform: input.platform,
      event_type: input.eventType,
      external_event_id: input.externalEventId,
      sender_name: input.senderName,
      message_text: input.messageText,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    // Postgres unique_violation — this exact event was already recorded.
    if (error.code === "23505") return null;
    throw error;
  }
  return data ? eventFromRow(data as SocialEventRow) : null;
}

export async function markSocialEventReplied(
  id: string,
  patch: { matchedRuleId: string | null; replied: boolean; replyText?: string | null; replyError?: string | null },
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ds_social_events")
    .update({
      matched_rule_id: patch.matchedRuleId,
      replied: patch.replied,
      reply_text: patch.replyText ?? null,
      reply_error: patch.replyError ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}
