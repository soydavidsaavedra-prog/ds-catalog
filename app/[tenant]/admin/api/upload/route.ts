import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/media/storage-bucket";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getEffectivePlanForTenant } from "@/lib/tenant/plan-limits";
import { getStorageUsageForSlug } from "@/lib/repositories/storage-repository";

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
// Hero background videos are meant to be short, muted loops, not real
// clips — this cap keeps that honest and keeps a single upload from
// eating a big chunk of a tenant's plan storage (see the maxStorageMb
// check below, which still applies on top of this). It's also a hard
// ceiling imposed from outside this file: Vercel rejects request bodies
// over ~4.5MB at the platform level, before this route's own code ever
// runs, returning an HTML error page instead of JSON — so anything closer
// to that limit than this breaks the client's res.json() call with a
// confusing "Unexpected token" error rather than the size message below.
const MAX_VIDEO_SIZE = 4 * 1024 * 1024;
const BUCKET = PRODUCT_IMAGES_BUCKET;

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  if (!(await isAdminAuthenticated(tenantSlug))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }
  const extension = ALLOWED_EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Formato no soportado (usa JPG, PNG, WEBP, AVIF, SVG, MP4 o WEBM)" },
      { status: 400 },
    );
  }
  const isVideo = VIDEO_TYPES.has(file.type);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: isVideo ? "El video supera 4MB" : "La imagen supera 8MB" },
      { status: 400 },
    );
  }

  // Compression to ~500KB happens client-side before this request is even
  // sent — see lib/utils/image-compress.ts. That file already explains why
  // it isn't done here with sharp: sharp's native binaries proved
  // unreliable to load inside a Vercel serverless function, and a failure
  // there broke every upload through this route, not just large ones.
  const buffer = Buffer.from(await file.arrayBuffer());

  // Storage is an internal, superadmin-managed number — never named as
  // such in what the tenant sees here (per the plan's own design: limits
  // are enforced for real, but "storage"/"MB" is not a concept the tenant
  // needs to reason about, only "your plan's limit").
  const tenant = await resolveTenant(tenantSlug);
  const plan = await getEffectivePlanForTenant(tenant.id);
  if (plan?.maxImages != null || plan?.maxStorageMb != null) {
    const usage = await getStorageUsageForSlug(tenantSlug);
    if (plan.maxImages != null && usage.fileCount >= plan.maxImages) {
      return NextResponse.json({ error: "Alcanzaste el límite de imágenes de tu plan." }, { status: 403 });
    }
    if (plan.maxStorageMb != null && usage.totalBytes + buffer.length > plan.maxStorageMb * 1024 * 1024) {
      return NextResponse.json(
        { error: "Alcanzaste el límite de tu plan. Contacta a soporte para ampliarlo." },
        { status: 403 },
      );
    }
  }

  // Path-prefixed by tenant slug so uploads are visibly namespaced per
  // tenant inside the shared bucket (tenant-slug/uuid.ext), even though
  // the bucket itself stays public-read for all tenants (same model as
  // before — see the schema.sql note on this bucket's policy).
  const filename = `${tenantSlug}/${randomUUID()}.${extension}`;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
