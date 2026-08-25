import "server-only";
import { getSubscriptionByTenantId } from "@/lib/repositories/subscriptions-repository";
import { getPlanById, type Plan } from "@/lib/repositories/plans-repository";

/**
 * A tenant with no subscription assigned (every tenant today, unless a
 * Super Admin deliberately assigns one from /superadmin) has no plan and
 * therefore no limits — same "unlimited until assigned" guarantee as the
 * rest of Fase 4/5. Real enforcement (product count in
 * app/[tenant]/admin/actions.ts createProductAction, storage in
 * app/[tenant]/admin/api/upload/route.ts) only ever kicks in once this
 * returns a plan with a non-null limit.
 */
export async function getEffectivePlanForTenant(tenantId: string): Promise<Plan | null> {
  const subscription = await getSubscriptionByTenantId(tenantId);
  if (!subscription) return null;
  return getPlanById(subscription.planId);
}

/**
 * A tenant with no subscription (still every existing tenant, unless a
 * Super Admin assigns one) is never frozen by this — only "expired" or
 * "cancelled" freezes, both storefront (app/[tenant]/(storefront)/layout.tsx)
 * and the tenant's own admin session (app/[tenant]/admin/(shell)/layout.tsx).
 * "trial"/"active"/"paused" subscription statuses do not freeze — "paused"
 * here means the Super Admin paused billing tracking, not that the tenant
 * should lose access; ds_tenants.status ('paused'/'suspended'/'archived',
 * see lib/types/tenant.ts) is the deliberate, superadmin-driven way to
 * freeze a tenant, already enforced by resolveTenant() everywhere. This is
 * the second, independent way it can happen: automatically, because a
 * plan ran out — same end state, different cause.
 */
export async function isSubscriptionFrozen(tenantId: string): Promise<boolean> {
  const subscription = await getSubscriptionByTenantId(tenantId);
  if (!subscription) return false;
  return subscription.status === "expired" || subscription.status === "cancelled";
}
