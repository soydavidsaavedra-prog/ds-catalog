import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
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
};
const MAX_SIZE = 8 * 1024 * 1024;
const BUCKET = PRODUCT_IMAGES_BUCKET;

// ---------- Compression ----------

/** Never compress past this — an already-small file is left byte-for-byte untouched. */
const TARGET_MAX_BYTES = 500 * 1024;
const QUALITY_STEPS = [80, 70, 60, 50, 40, 30];
/** Only tried if quality reduction alone can't reach the target at full size. */
const MAX_DIMENSION_STEPS = [1600, 1200, 900];

type SharpInstance = ReturnType<typeof sharp>;

function encodeAt(image: SharpInstance, contentType: string, quality: number): SharpInstance {
  switch (contentType) {
    case "image/png":
      // PNG is lossless by default — quality only has an effect once a
      // palette-quantization step (the actual lossy part) is turned on.
      return image.png({ quality, palette: true });
    case "image/webp":
      return image.webp({ quality });
    case "image/avif":
      return image.avif({ quality });
    case "image/jpeg":
    default:
      return image.jpeg({ quality, mozjpeg: true });
  }
}

/**
 * Re-encodes a raster image at decreasing quality (and, if that alone isn't
 * enough, decreasing max dimension) until it's under TARGET_MAX_BYTES,
 * keeping the same format throughout. Stops at the first attempt that fits;
 * if nothing gets there, returns the smallest one produced rather than the
 * original — compression is always best-effort, an upload is never
 * rejected just because a very dense image can't quite hit 500KB.
 */
async function compressImage(buffer: Buffer, contentType: string): Promise<Buffer> {
  // SVG is vector — rasterizing it would throw away the exact property
  // (infinite scale, inherently tiny file) that makes SVG the right choice
  // for a logo in the first place, so it's left alone entirely.
  if (contentType === "image/svg+xml") return buffer;
  if (buffer.length <= TARGET_MAX_BYTES) return buffer;

  let smallest = buffer;

  for (const quality of QUALITY_STEPS) {
    const output = await encodeAt(sharp(buffer, { failOn: "none" }), contentType, quality).toBuffer();
    if (output.length < smallest.length) smallest = output;
    if (output.length <= TARGET_MAX_BYTES) return output;
  }

  for (const maxDimension of MAX_DIMENSION_STEPS) {
    for (const quality of QUALITY_STEPS) {
      const resized = sharp(buffer, { failOn: "none" }).resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      });
      const output = await encodeAt(resized, contentType, quality).toBuffer();
      if (output.length < smallest.length) smallest = output;
      if (output.length <= TARGET_MAX_BYTES) return output;
    }
  }

  return smallest;
}

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
    return NextResponse.json({ error: "Formato no soportado (usa JPG, PNG, WEBP, AVIF o SVG)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera 8MB" }, { status: 400 });
  }

  // Compressed before the plan-limit check below, so that check (and what
  // actually lands in Storage) reflects real stored bytes, not the size of
  // the file the browser happened to send. Compression is a nice-to-have,
  // never a reason to block the actual upload — if sharp fails for any
  // reason, fall back to storing the original bytes untouched.
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const buffer = await compressImage(rawBuffer, file.type).catch(() => rawBuffer);

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
