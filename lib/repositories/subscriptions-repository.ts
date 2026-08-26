import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { SubscriptionRow, SubscriptionStatus } from "@/lib/db/supabase-types";

export type { SubscriptionStatus };

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  requestedPlanId: string | null;
  startedAt: string;
  expiresAt: string | null;
}

function fromRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    planId: row.plan_id,
    status: row.status,
    requestedPlanId: row.requested_plan_id ?? null,
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

/**
 * The tenant's own /admin/cuenta page calls this to ask for a better plan
 * — deliberately does NOT touch plan_id/status, so the tenant keeps normal
 * access on their current plan while a Super Admin reviews the request
 * (approvePlanChangeRequest below) or dismisses it
 * (clearPlanChangeRequest). Requires an existing subscription: a tenant
 * with none yet (pre-plans tenants, or one still "pending" its first
 * approval) has nothing to request a change *from*.
 */
export async function requestPlanChange(tenantId: string, planId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("subscriptions").update({ requested_plan_id: planId }).eq("tenant_id", tenantId);
  if (error) throw error;
}

export async function clearPlanChangeRequest(tenantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("subscriptions").update({ requested_plan_id: null }).eq("tenant_id", tenantId);
  if (error) throw error;
}

/** Super Admin approves a tenant-requested plan change: moves it into plan_id/status and clears the request in one step. */
export async function approvePlanChangeRequest(tenantId: string, requestedPlanId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ plan_id: requestedPlanId, status: "active", requested_plan_id: null })
    .eq("tenant_id", tenantId);
  if (error) throw error;
}

/**
 * Only embeds ds_tenants (a single, unambiguous FK) — resolving
 * requestedPlanId's/planId's names is left to the caller via listPlans(),
 * since subscriptions now has two FKs into plans (plan_id and
 * requested_plan_id) and PostgREST's embed syntax needs an explicit FK
 * hint to disambiguate that the Database type in supabase-types.ts
 * doesn't declare — not worth the type-plumbing for one dashboard list.
 */
export async function listPendingPlanChangeRequests(): Promise<
  { tenantId: string; tenantName: string; tenantSlug: string; planId: string; requestedPlanId: string }[]
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tenant_id, plan_id, requested_plan_id, ds_tenants(name, slug)")
    .not("requested_plan_id", "is", null);
  if (error) throw error;

  return (data as unknown as { tenant_id: string; plan_id: string; requested_plan_id: string; ds_tenants: { name: string; slug: string } | null }[]).map(
    (row) => ({
      tenantId: row.tenant_id,
      tenantName: row.ds_tenants?.name ?? "—",
      tenantSlug: row.ds_tenants?.slug ?? "",
      planId: row.plan_id,
      requestedPlanId: row.requested_plan_id,
    }),
  );
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
