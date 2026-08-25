/**
 * "active" is the only status resolveTenant() serves — paused/suspended/
 * archived all 404 the storefront identically (see
 * lib/tenant/resolve-tenant.ts), differing only in what they mean to the
 * Super Admin: paused = tenant/owner chose to pause, suspended = platform
 * action (e.g. non-payment), archived = permanently retired but never
 * deleted.
 */
export type TenantStatus = "active" | "paused" | "suspended" | "archived";

/**
 * What kind of business this tenant runs — chosen at registration (or set
 * by a Super Admin), drives which optional product attributes make sense
 * for them (see lib/tenant/business-type.ts's BUSINESS_TYPE_PROFILES: a
 * "ferreteria" tenant's product form has no reason to show Tallas/Colores,
 * a "moda" tenant's does). "moda" is the default for every tenant created
 * before this concept existed (El Nuevo Sánchez, demo) — deliberately
 * chosen so their behavior doesn't change: full sizes/colors support,
 * exactly as before.
 */
export type BusinessType = "moda" | "ferreteria" | "restaurante" | "belleza" | "tecnologia" | "hogar" | "otro";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  businessType: BusinessType;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
