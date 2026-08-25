import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SubscriptionRow, SubscriptionStatus } from "@/lib/db/supabase-types";

export type { SubscriptionStatus };

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
}

function fromRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    planId: row.plan_id,
    status: row.status,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
  };
}

export async function getSubscriptionByTenantId(tenantId: string): Promise<Subscription | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("subscriptions").select("*").eq("tenant_id", tenantId).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as SubscriptionRow) : null;
}

/** One row per tenant (unique constraint on tenant_id) — assigning a plan creates it the first time, updates it after. */
export async function assignPlanToTenant(
  tenantId: string,
  planId: string,
  status: SubscriptionStatus,
  expiresAt: string | null,
): Promise<Subscription> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      { tenant_id: tenantId, plan_id: planId, status, expires_at: expiresAt, started_at: new Date().toISOString() },
      { onConflict: "tenant_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as SubscriptionRow);
}

export async function updateSubscriptionStatus(tenantId: string, status: SubscriptionStatus): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("subscriptions").update({ status }).eq("tenant_id", tenantId);
  if (error) throw error;
}

export interface SubscriptionWithDetails extends Subscription {
  tenantName: string;
  tenantSlug: string;
  plan: { id: string; key: string; name: string; priceCents: number } | null;
}

/**
 * One list-with-join query for /superadmin/subscriptions — Supabase's PostgREST
 * embed syntax (`plans(*), ds_tenants(*)`) works here because both are real
 * foreign keys, so this isn't the manual client-side-join workaround
 * PocketBase forced Horizon into (see docs/ANALISIS_HORIZON_REFERENCIA_SAAS.md
 * section 8) — Postgres does the join.
 */
export async function listSubscriptionsWithDetails(): Promise<SubscriptionWithDetails[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans(*), ds_tenants(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    data as (SubscriptionRow & {
      plans: { id: string; key: string; name: string; price_cents: number } | null;
      ds_tenants: { name: string; slug: string } | null;
    })[]
  ).map((row) => ({
    ...fromRow(row),
    tenantName: row.ds_tenants?.name ?? "—",
    tenantSlug: row.ds_tenants?.slug ?? "",
    plan: row.plans
      ? { id: row.plans.id, key: row.plans.key, name: row.plans.name, priceCents: row.plans.price_cents }
      : null,
  }));
}
