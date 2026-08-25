import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import { listAllTenants, getTenantById } from "@/lib/repositories/tenant-repository";
import type { Tenant } from "@/lib/types/tenant";

/**
 * Cross-tenant reads for the Super Admin only — every other repository in
 * lib/repositories/* takes a tenantId and filters by it; mixing a "give me
 * everything" query into one of those would make it too easy for
 * tenant-facing code to accidentally call it without a filter. Kept
 * separate on purpose, and only ever imported from app/superadmin/*.
 */

export interface TenantCounts {
  products: number;
  categories: number;
  orders: number;
}

export interface TenantSummary extends Tenant {
  counts: TenantCounts;
}

/**
 * One query per table (not one per tenant) — pulls just the tenant_id
 * column for every row in ns_products/ns_categories/ns_orders and counts
 * client-side. Cheap while the platform is this small; if it ever
 * becomes a real cost, switch to a Postgres view/RPC that does the count
 * server-side — not needed yet (see docs/ARCHITECTURE.md on not
 * over-engineering ahead of an actual bottleneck).
 */
async function countRowsPerTenant(table: "ns_products" | "ns_categories" | "ns_orders"): Promise<Map<string, number>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(table).select("tenant_id");
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data as { tenant_id: string }[]) {
    counts.set(row.tenant_id, (counts.get(row.tenant_id) ?? 0) + 1);
  }
  return counts;
}

export async function listAllTenantsWithCounts(): Promise<TenantSummary[]> {
  const [tenants, productCounts, categoryCounts, orderCounts] = await Promise.all([
    listAllTenants(),
    countRowsPerTenant("ns_products"),
    countRowsPerTenant("ns_categories"),
    countRowsPerTenant("ns_orders"),
  ]);

  return tenants.map((tenant) => ({
    ...tenant,
    counts: {
      products: productCounts.get(tenant.id) ?? 0,
      categories: categoryCounts.get(tenant.id) ?? 0,
      orders: orderCounts.get(tenant.id) ?? 0,
    },
  }));
}

export interface PlatformKpis {
  totalTenants: number;
  activeTenants: number;
  pausedTenants: number;
  suspendedTenants: number;
  archivedTenants: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
}

export function derivePlatformKpis(tenants: TenantSummary[]): PlatformKpis {
  return {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.status === "active").length,
    pausedTenants: tenants.filter((t) => t.status === "paused").length,
    suspendedTenants: tenants.filter((t) => t.status === "suspended").length,
    archivedTenants: tenants.filter((t) => t.status === "archived").length,
    totalProducts: tenants.reduce((sum, t) => sum + t.counts.products, 0),
    totalCategories: tenants.reduce((sum, t) => sum + t.counts.categories, 0),
    totalOrders: tenants.reduce((sum, t) => sum + t.counts.orders, 0),
  };
}

export async function getTenantSummaryById(tenantId: string): Promise<TenantSummary | null> {
  const tenant = await getTenantById(tenantId);
  if (!tenant) return null;

  const supabase = getSupabaseClient();
  const [{ count: products }, { count: categories }, { count: orders }] = await Promise.all([
    supabase.from("ns_products").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("ns_categories").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("ns_orders").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
  ]);

  return {
    ...tenant,
    counts: { products: products ?? 0, categories: categories ?? 0, orders: orders ?? 0 },
  };
}
