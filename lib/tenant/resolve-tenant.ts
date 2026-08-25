import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { TenantRow } from "@/lib/db/supabase-types";
import type { Tenant } from "@/lib/types/tenant";

/**
 * Single central place that turns a URL tenant slug into a tenant record
 * (and therefore a tenantId) — every route under app/[tenant]/... calls
 * this instead of querying ds_tenants directly, and every repository call
 * downstream takes the resulting tenantId. Wrapped in React's cache() so
 * the many server components on one request (layout, page, header,
 * footer, ...) share a single Supabase round-trip instead of one each.
 */

function fromRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    businessType: row.business_type,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const resolveTenant = cache(async (slug: string): Promise<Tenant> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ds_tenants").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data || data.status !== "active") notFound();
  return fromRow(data as TenantRow);
});

export const listActiveTenants = cache(async (): Promise<Tenant[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ds_tenants").select("*").eq("status", "active");
  if (error) throw error;
  return (data as TenantRow[]).map(fromRow);
});
