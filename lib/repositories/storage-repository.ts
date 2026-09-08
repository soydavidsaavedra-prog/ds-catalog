import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import { listAllTenants } from "@/lib/repositories/tenant-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { listBanners } from "@/lib/repositories/banner-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { listHeroSlides } from "@/lib/repositories/hero-slide-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { listOrders } from "@/lib/repositories/order-repository";
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

/** Converts a public Storage URL (as returned by getPublicUrl) back into the bucket-relative path .remove() expects. Returns null for anything that isn't a real object in this bucket — a "placeholder:..." marker, an empty string, or a URL from somewhere else entirely. */
function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

/**
 * Deletes the real Storage objects behind these public URLs — the
 * per-edit counterpart to deleteAllFilesForTenant below: called whenever a
 * product, banner, category, or settings save drops an image (deleted
 * outright, or swapped for a different one), so removing something in the
 * admin panel actually frees the space instead of leaving it orphaned in
 * the bucket forever. Placeholders, nulls, and empty strings are silently
 * skipped — callers pass whatever a field held without checking first.
 */
export async function deleteStorageFilesByUrls(urls: (string | null | undefined)[]): Promise<void> {
  const paths = urls.map((u) => (u ? storagePathFromPublicUrl(u) : null)).filter((p): p is string => p !== null);
  if (paths.length === 0) return;

  const supabase = getSupabaseClient();
  const pageSize = 100;
  for (let i = 0; i < paths.length; i += pageSize) {
    const batch = paths.slice(i, i + pageSize);
    const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(batch);
    if (error) throw error;
  }
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

export interface OrphanedFile {
  path: string;
  sizeBytes: number;
}

/**
 * Real Storage objects under a tenant's prefix that no row in the database
 * references any more — normal editing already deletes a file's own
 * object the moment it's replaced/removed (see deleteStorageFilesByUrls's
 * call sites in app/[tenant]/admin/actions.ts), so an orphan here means
 * something interrupted that path: an upload whose form was abandoned
 * before saving, a crash between upload and save, or a manual DB edit.
 *
 * Cross-checks every field that can legitimately still need a file:
 * every product's images, every banner/category image, every hero
 * slide's media (image or video), every settings image (hero, logo,
 * payment badge, the 5 story-step photos, statement), AND every past
 * order's item snapshot — an order keeps its own copy of the product
 * photo as it looked at checkout time (see OrderItem.image, populated in
 * NSProductPurchasePanel), so a photo a product no longer uses can still
 * be legitimately displayed on an old order and must not be swept.
 *
 * Read-only — see deleteOrphanedFiles for the actual (irreversible)
 * delete step, kept as a separate, explicit action so a Super Admin
 * always reviews the list before anything is removed.
 */
export async function findOrphanedFilesForTenant(tenantId: string, tenantSlug: string): Promise<OrphanedFile[]> {
  const [files, products, banners, categories, heroSlides, settings, orders] = await Promise.all([
    listAllFilesInPrefix(tenantSlug),
    listProducts(tenantId),
    listBanners(tenantId),
    listCategories(tenantId),
    listHeroSlides(tenantId),
    getSettings(tenantId),
    listOrders(tenantId),
  ]);

  if (tenantSlug === LEGACY_ROOT_FILES_TENANT_SLUG) {
    files.push(...(await listLegacyRootFiles()));
  }

  const referencedUrls: (string | null | undefined)[] = [
    ...products.flatMap((p) => p.images),
    ...banners.map((b) => b.image),
    ...categories.map((c) => c.image),
    ...heroSlides.map((h) => h.mediaUrl),
    ...orders.flatMap((o) => o.items.map((item) => item.image)),
    settings.heroImage,
    settings.brandLogo,
    settings.paymentBadgeIcon,
    settings.storyStepImage1,
    settings.storyStepImage2,
    settings.storyStepImage3,
    settings.storyStepImage4,
    settings.storyStepImage5,
    settings.statementImage,
  ];

  const referencedPaths = new Set(
    referencedUrls.map((url) => (url ? storagePathFromPublicUrl(url) : null)).filter((p): p is string => p !== null),
  );

  return files.filter((f) => !referencedPaths.has(f.path)).map((f) => ({ path: f.path, sizeBytes: f.sizeBytes }));
}

/** Permanently removes the given Storage paths — meant to be called only with paths a prior findOrphanedFilesForTenant call actually returned, after a human has reviewed the list. Same batching as deleteAllFilesForTenant. */
export async function deleteOrphanedFiles(paths: string[]): Promise<{ deletedCount: number }> {
  if (paths.length === 0) return { deletedCount: 0 };

  const supabase = getSupabaseClient();
  const pageSize = 100;
  for (let i = 0; i < paths.length; i += pageSize) {
    const batch = paths.slice(i, i + pageSize);
    const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(batch);
    if (error) throw error;
  }
  return { deletedCount: paths.length };
}
