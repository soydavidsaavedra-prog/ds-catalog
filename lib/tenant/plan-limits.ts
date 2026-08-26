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

/** A tenant inside this window (and not already frozen) gets the "tu plan vence pronto" banner — see NSPlanExpiryBanner. */
export const EXPIRY_WARNING_DAYS = 7;

export interface PlanStatusInfo {
  freezeReason: FreezeReason | null;
  expiresAt: string | null;
  /** Only set when not frozen and expiresAt exists — how many days remain, rounded up. Negative/zero would mean "already past", but that case is always folded into freezeReason "expired" instead (see below), so this is never <= 0 in practice. */
  daysUntilExpiry: number | null;
}

/**
 * A tenant with no subscription (still every tenant created before plans
 * existed — elnuevosanchez, demo, and anything a Super Admin created by
 * hand without assigning one) is never frozen by this — only "pending",
 * "expired", or "cancelled" freeze, both storefront
 * (app/[tenant]/(storefront)/layout.tsx) and the tenant's own admin
 * session (app/[tenant]/admin/(shell)/layout.tsx). "trial"/"active"/
 * "paused" subscription statuses do not freeze on their own — "paused"
 * here means the Super Admin paused billing tracking, not that the tenant
 * should lose access; ds_tenants.status ('paused'/'suspended'/'archived',
 * see lib/types/tenant.ts) is the deliberate, superadmin-driven way to
 * freeze a tenant, already enforced by resolveTenant() everywhere.
 *
 * "pending" is new: every tenant that self-registers via /registro picks
 * a plan during onboarding (completeOnboardingAction) and gets a
 * subscription created with this status — unlike the legacy "no
 * subscription = active and unlimited" tenants above, a self-registered
 * tenant is deliberately frozen from the moment onboarding finishes until
 * a Super Admin reviews the request and flips it to "active" from the
 * tenant's detail page.
 *
 * Also new: an "active"/"trial" subscription past its own expires_at
 * freezes exactly like status "expired" would, even though nothing in
 * this app flips the stored status column automatically (there's no cron
 * job) — this is computed live on every check instead, which is why
 * "bloquear al vencer" works without needing one. The stored status stays
 * whatever a Super Admin last set it to (cosmetic, until they renew it);
 * this function is the only thing anything else should trust.
 */
export async function getPlanStatusInfo(tenantId: string): Promise<PlanStatusInfo> {
  const subscription = await getSubscriptionByTenantId(tenantId);
  if (!subscription) return { freezeReason: null, expiresAt: null, daysUntilExpiry: null };

  if (subscription.status === "pending" || subscription.status === "cancelled") {
    return { freezeReason: subscription.status, expiresAt: subscription.expiresAt, daysUntilExpiry: null };
  }

  const expiresAtMs = subscription.expiresAt ? new Date(subscription.expiresAt).getTime() : null;
  const pastExpiry = expiresAtMs !== null && expiresAtMs <= Date.now();
  if (subscription.status === "expired" || pastExpiry) {
    return { freezeReason: "expired", expiresAt: subscription.expiresAt, daysUntilExpiry: null };
  }

  const daysUntilExpiry = expiresAtMs !== null ? Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  return { freezeReason: null, expiresAt: subscription.expiresAt, daysUntilExpiry };
}

export async function getFreezeReason(tenantId: string): Promise<FreezeReason | null> {
  return (await getPlanStatusInfo(tenantId)).freezeReason;
}

export async function isSubscriptionFrozen(tenantId: string): Promise<boolean> {
  return (await getFreezeReason(tenantId)) !== null;
}
