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

export type FreezeReason = "pending" | "expired" | "cancelled";

/**
 * A tenant with no subscription (still every tenant created before plans
 * existed — elnuevosanchez, demo, and anything a Super Admin created by
 * hand without assigning one) is never frozen by this — only "pending",
 * "expired", or "cancelled" freeze, both storefront
 * (app/[tenant]/(storefront)/layout.tsx) and the tenant's own admin
 * session (app/[tenant]/admin/(shell)/layout.tsx). "trial"/"active"/
 * "paused" subscription statuses do not freeze — "paused" here means the
 * Super Admin paused billing tracking, not that the tenant should lose
 * access; ds_tenants.status ('paused'/'suspended'/'archived', see
 * lib/types/tenant.ts) is the deliberate, superadmin-driven way to freeze
 * a tenant, already enforced by resolveTenant() everywhere.
 *
 * "pending" is new: every tenant that self-registers via /registro picks
 * a plan during onboarding (completeOnboardingAction) and gets a
 * subscription created with this status — unlike the legacy "no
 * subscription = active and unlimited" tenants above, a self-registered
 * tenant is deliberately frozen from the moment onboarding finishes until
 * a Super Admin reviews the request and flips it to "active" from the
 * tenant's detail page. This is what actually closes the "anyone can
 * self-register into a free, fully working account" gap.
 */
export async function getFreezeReason(tenantId: string): Promise<FreezeReason | null> {
  const subscription = await getSubscriptionByTenantId(tenantId);
  if (!subscription) return null;
  if (subscription.status === "pending" || subscription.status === "expired" || subscription.status === "cancelled") {
    return subscription.status;
  }
  return null;
}

export async function isSubscriptionFrozen(tenantId: string): Promise<boolean> {
  return (await getFreezeReason(tenantId)) !== null;
}
