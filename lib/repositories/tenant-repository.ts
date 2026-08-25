import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { TenantRow } from "@/lib/db/supabase-types";
import type { Tenant, TenantStatus } from "@/lib/types/tenant";

function fromRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    onboardingCompleted: row.onboarding_completed,
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

/** Auth-only lookup — never exposed as part of the public Tenant type. */
export async function getTenantAuthRecord(
  slug: string,
): Promise<{ id: string; adminPasswordHash: string | null } | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_tenants")
    .select("id, admin_password_hash")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, adminPasswordHash: data.admin_password_hash };
}

export interface CreateTenantInput {
  slug: string;
  name: string;
  adminPasswordHash: string;
}

/**
 * Creates a new tenant, live immediately (status "active") — there is no
 * subscription/plan gating yet (see docs/ANALISIS_HORIZON_REFERENCIA_SAAS.md
 * section 6), so a self-registered tenant's storefront is reachable as
 * soon as onboarding finishes, same as any tenant seeded by hand.
 */
export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_tenants")
    .insert({
      slug: input.slug,
      name: input.name,
      status: "active",
      admin_password_hash: input.adminPasswordHash,
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

/** Super Admin only — changes reachability (see resolveTenant), never touches the tenant's rows in ns_*. */
export async function updateTenantStatus(tenantId: string, status: TenantStatus): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ds_tenants").update({ status }).eq("id", tenantId);
  if (error) throw error;
}
