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
 * complete accounting for every tenant created after the multi-tenant
 * migration — every object belongs to exactly one tenant.
 *
 * One historical exception: before that migration, the upload route saved
 * straight to the bucket root ("<uuid>.<ext>", no tenant folder at all —
 * see the pre-migration version of the upload route in git history,
 * commit 839d5d8). El Nuevo Sánchez is the only tenant that existed then,
 * so every one of those root-level files is really its storage — without
 * this, its real usage undercounts (its own admin-uploaded photos before
 * the migration don't show up under "elnuevosanchez/" at all, while newer
 * tenants with fewer files but no pre-migration history look accurate by
 * comparison). This is a one-time historical fact, not an assumption that
 * keeps applying going forward — every tenant created since the migration
 * (demo, and anything self-registered) has always been fully prefixed.
 */
const LEGACY_ROOT_FILES_TENANT_SLUG = "elnuevosanchez";

interface StorageFile {
  /** Full path inside the bucket (e.g. "elnuevosanchez/uuid.jpg", or bare "uuid.jpg" for a legacy root file) — needed for .remove(), not just usage totals. */
  path: string;
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
      files.push({ path: prefix ? `${prefix}/${entry.name}` : entry.name, sizeBytes: typeof size === "number" ? size : 0 });
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return files;
}

/** Real objects sitting directly in the bucket root — see LEGACY_ROOT_FILES_TENANT_SLUG above. Folder pseudo-entries (id === null) are already excluded by listAllFilesInPrefix. */
async function listLegacyRootFiles(): Promise<StorageFile[]> {
  return listAllFilesInPrefix("");
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
  const legacyRootFiles = await listLegacyRootFiles();

  const usage = await Promise.all(
    tenants.map(async (tenant): Promise<TenantStorageUsage> => {
      const files = await listAllFilesInPrefix(tenant.slug);
      if (tenant.slug === LEGACY_ROOT_FILES_TENANT_SLUG) {
        files.push(...legacyRootFiles);
      }
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
  if (tenantSlug === LEGACY_ROOT_FILES_TENANT_SLUG) {
    files.push(...(await listLegacyRootFiles()));
  }
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

/**
 * Permanently removes every Storage object belonging to a tenant — called
 * from deleteTenantAction (app/superadmin/actions.ts) as part of a hard
 * delete, so no orphaned files are left behind (see the module comment
 * above on why that matters: the collapse-avoidance concern this whole
 * legacy-file accounting exists for). Same tenant-prefix + legacy-root-file
 * logic as getStorageUsageForSlug above, but deleting instead of counting.
 * Batches through .remove() since Storage doesn't document an unbounded
 * limit on how many paths one call can take — same page size as list().
 */
export async function deleteAllFilesForTenant(tenantSlug: string): Promise<{ deletedCount: number }> {
  const supabase = getSupabaseClient();
  const files = await listAllFilesInPrefix(tenantSlug);
  if (tenantSlug === LEGACY_ROOT_FILES_TENANT_SLUG) {
    files.push(...(await listLegacyRootFiles()));
  }
  if (files.length === 0) return { deletedCount: 0 };

  const pageSize = 100;
  for (let i = 0; i < files.length; i += pageSize) {
    const batch = files.slice(i, i + pageSize).map((f) => f.path);
    const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(batch);
    if (error) throw error;
  }
  return { deletedCount: files.length };
}
