import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import { listAllTenants } from "@/lib/repositories/tenant-repository";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/media/storage-bucket";

/**
 * Real Storage usage — no guessed or cached-and-forgotten numbers. Uses
 * the Storage API's .list() (which reads the same underlying
 * storage.objects Postgres table server-side) rather than a direct SQL
 * query against the `storage` schema: that schema usually isn't exposed
 * through PostgREST on a stock Supabase project (only `public` is, by
 * default), while .list() works with the same service_role key already
 * used everywhere else in this app, with no extra configuration required.
 * The upload route (app/[tenant]/admin/api/upload/route.ts) always saves
 * as "<tenantSlug>/<uuid>.<ext>", so listing by tenant slug prefix is a
 * complete accounting — every object belongs to exactly one tenant.
 */

interface StorageFile {
  sizeBytes: number;
}

async function listAllFilesInPrefix(prefix: string): Promise<StorageFile[]> {
  const supabase = getSupabaseClient();
  const files: StorageFile[] = [];
  const pageSize = 100;
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).list(prefix, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const entry of data) {
      // Supabase Storage's list() returns pseudo-entries for "folders"
      // (id === null) alongside real objects — this bucket has no nested
      // folders under a tenant prefix (the upload route only ever writes
      // "<slug>/<uuid>.<ext>"), but skip them defensively rather than
      // assume that never changes.
      if (entry.id === null) continue;
      const size = (entry.metadata as { size?: number } | null)?.size;
      files.push({ sizeBytes: typeof size === "number" ? size : 0 });
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return files;
}

export interface TenantStorageUsage {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  fileCount: number;
  totalBytes: number;
}

export async function getStorageUsageByTenant(): Promise<TenantStorageUsage[]> {
  const tenants = await listAllTenants();

  const usage = await Promise.all(
    tenants.map(async (tenant): Promise<TenantStorageUsage> => {
      const files = await listAllFilesInPrefix(tenant.slug);
      return {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
        fileCount: files.length,
        totalBytes: files.reduce((sum, f) => sum + f.sizeBytes, 0),
      };
    }),
  );

  return usage.sort((a, b) => b.totalBytes - a.totalBytes);
}

/** Single-tenant version of getStorageUsageByTenant, for the tenant detail page — avoids listing every other tenant's files just to show one. */
export async function getStorageUsageForSlug(tenantSlug: string): Promise<{ fileCount: number; totalBytes: number }> {
  const files = await listAllFilesInPrefix(tenantSlug);
  return { fileCount: files.length, totalBytes: files.reduce((sum, f) => sum + f.sizeBytes, 0) };
}

export function deriveGlobalStorageUsage(usage: TenantStorageUsage[]): { totalBytes: number; totalFiles: number } {
  return {
    totalBytes: usage.reduce((sum, u) => sum + u.totalBytes, 0),
    totalFiles: usage.reduce((sum, u) => sum + u.fileCount, 0),
  };
}

/**
 * Real Postgres database size via a tiny RPC (see supabase/schema.sql's
 * "database size RPC" section) — pg_database_size() isn't reachable
 * through PostgREST's table/view surface, only through an explicit
 * function call, which is exactly what this is. Returns null (never a
 * guessed number) if the RPC hasn't been created yet — see
 * app/superadmin/(shell)/storage/page.tsx for how that's surfaced as
 * "not available yet" rather than a fake 0.
 */
export async function getDatabaseSizeBytes(): Promise<number | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_database_size_bytes");
  if (error) return null;
  return typeof data === "number" ? data : null;
}
