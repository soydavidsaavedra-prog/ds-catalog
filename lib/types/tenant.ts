/**
 * "active" is the only status resolveTenant() serves — paused/suspended/
 * archived all 404 the storefront identically (see
 * lib/tenant/resolve-tenant.ts), differing only in what they mean to the
 * Super Admin: paused = tenant/owner chose to pause, suspended = platform
 * action (e.g. non-payment), archived = permanently retired but never
 * deleted.
 */
export type TenantStatus = "active" | "paused" | "suspended" | "archived";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
