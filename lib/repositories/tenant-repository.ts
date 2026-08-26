import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { TenantRow } from "@/lib/db/supabase-types";
import type { BusinessType, Tenant, TenantStatus } from "@/lib/types/tenant";

function fromRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    // Fallback covers a row read before the business_type migration was
    // applied — Supabase returns undefined for a column it doesn't know
    // about yet; "moda" is the original behavior every tenant had.
    businessType: row.business_type ?? "moda",
    onboardingCompleted: row.onboarding_completed,
    deletionRequestedAt: row.deletion_requested_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function isTenantSlugTaken(slug: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ds_tenants").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data !== null;
}

export interface CreateTenantInput {
  slug: string;
  name: string;
  businessType: BusinessType;
}

/**
 * Creates a new tenant, live immediately (status "active") — there is no
 * subscription/plan gating yet (see docs/ANALISIS_HORIZON_REFERENCIA_SAAS.md
 * section 6), so a self-registered tenant's storefront is reachable as
 * soon as onboarding finishes, same as any tenant seeded by hand.
 *
 * admin_password_hash is always null now — real identity (who can log in
 * as this tenant's owner) lives in Supabase Auth + ds_app_users (see
 * lib/repositories/app-users-repository.ts), not on this row. The column
 * itself stays in the schema only because dropping it isn't worth the
 * migration risk; nothing reads it anymore.
 */
export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_tenants")
    .insert({
      slug: input.slug,
      name: input.name,
      status: "active",
      business_type: input.businessType,
      admin_password_hash: null,
      onboarding_completed: false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as TenantRow);
}

/**
 * A brand-new tenant's ns_settings row is built here with neutral,
 * business-agnostic copy — NOT the column defaults in supabase/schema.sql,
 * which are still El Nuevo Sánchez's own jeans-brand copy ("Especialista
 * en Jeans", "De la fábrica a tus manos", denim placeholder images) left
 * over from before the multi-tenant migration. Relying on those defaults
 * for a self-registered tenant would leak El Nuevo Sánchez's brand voice
 * into every new catalog, the same class of bug already fixed once for
 * NSLogo/NSPlaceholderArt — see scripts/seed-demo-tenant.ts for the same
 * pattern applied to the "demo" tenant.
 */
export async function createDefaultSettings(tenantId: string, brandName: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ns_settings").insert({
    tenant_id: tenantId,
    brand_name: brandName,
    slogan: "",
    brand_description: "",
    whatsapp_number: "",
    whatsapp_display: "",
    contact_email: "",
    contact_address: "",
    contact_maps_url: "",
    currency: "USD",
    instagram: "",
    facebook: "",
    tiktok: "",
    hero_eyebrow: "",
    hero_title_line1: brandName,
    hero_title_line2: "",
    hero_subtitle: "",
    hero_tagline: "",
    hero_cta_label: "Ver catálogo",
    hero_cta_href: "/catalogo",
    hero_image: `placeholder:${tenantId}:hero`,
    hero_image_position_x: 50,
    hero_image_position_y: 50,
    brand_logo: "",
    payment_badge_icon: "",
    payment_badge_label: "",
    story_eyebrow: "",
    story_title: "",
    story_description: "",
    story_step_image1: "",
    story_step_image2: "",
    story_step_image3: "",
    story_step_image4: "",
    story_step_image5: "",
    statement_title_line1: "",
    statement_title_line2: "",
    statement_description: "",
    statement_image: "",
  });
  if (error) throw error;
}

/** /admin/cuenta's "solicitar eliminación de cuenta" — sets a timestamp Super Admin sees on the tenant's own detail page; the actual hard-delete stays a separate, explicit action (deleteTenantAction) so nothing is ever destroyed just because a request exists. */
export async function requestAccountDeletion(tenantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ds_tenants")
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq("id", tenantId);
  if (error) throw error;
}

export async function cancelAccountDeletionRequest(tenantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_tenants").update({ deletion_requested_at: null }).eq("id", tenantId);
  if (error) throw error;
}

export async function completeOnboarding(tenantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ds_tenants")
    .update({ onboarding_completed: true })
    .eq("id", tenantId);
  if (error) throw error;
}

/** Super Admin only — every other read/write in the app is tenant-scoped by slug (from the URL) or id (from a resolved tenant), never a bare "list everything". */
export async function listAllTenants(): Promise<Tenant[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ds_tenants").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TenantRow[]).map(fromRow);
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ds_tenants").select("*").eq("id", tenantId).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as TenantRow) : null;
}

/**
 * Same lookup as resolveTenant, but returns null instead of calling
 * notFound() — for a spot that wants to *try* showing a tenant's
 * branding if the slug happens to be valid (e.g. /acceder's optional
 * ?tenant= hint) without ever being allowed to break the page over a
 * stale or mistyped slug. Deliberately doesn't filter by status: even a
 * paused tenant's name/logo is harmless to show on a login screen.
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ds_tenants").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as TenantRow) : null;
}

/** Super Admin only — changes reachability (see resolveTenant), never touches the tenant's rows in ns_*. */
export async function updateTenantStatus(tenantId: string, status: TenantStatus): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_tenants").update({ status }).eq("id", tenantId);
  if (error) throw error;
}

/** Super Admin only — reclassifying a tenant only changes which optional product fields its admin form shows (lib/tenant/business-type.ts); it never touches existing product/category rows. */
export async function updateTenantBusinessType(tenantId: string, businessType: BusinessType): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_tenants").update({ business_type: businessType }).eq("id", tenantId);
  if (error) throw error;
}

/**
 * Hard delete — irreversible, unlike updateTenantStatus above (which the
 * rest of the app still prefers for the normal "freeze this account" case).
 * Deletes every row for this tenant across ns_* in FK-safe order — products
 * before categories (ns_products holds a composite FK to ns_categories on
 * (tenant_id, category_slug); nothing else here has a cross-table FK to
 * worry about) — then the subscription row, then the tenant row itself.
 * Storage files are NOT handled here: see deleteAllFilesForTenant in
 * storage-repository.ts, which the caller (deleteTenantAction in
 * app/superadmin/actions.ts) runs first, before this, so a DB failure
 * never leaves files un-accounted-for by a tenant row that still exists.
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const del = async (
    table:
      | "ns_products"
      | "ns_categories"
      | "ns_banners"
      | "ns_hero_slides"
      | "ns_orders"
      | "ns_settings"
      | "subscriptions",
  ) => {
    const { error } = await supabase.from(table).delete().eq("tenant_id", tenantId);
    if (error) throw error;
  };

  await del("ns_products");
  await del("ns_categories");
  await del("ns_banners");
  await del("ns_hero_slides");
  await del("ns_orders");
  await del("ns_settings");
  await del("subscriptions");

  const { error } = await supabase.from("ds_tenants").delete().eq("id", tenantId);
  if (error) throw error;
}
