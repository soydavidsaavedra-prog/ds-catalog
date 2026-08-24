import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { getSupabaseClient } from "@/lib/db/supabaseClient";

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};
const MAX_SIZE = 8 * 1024 * 1024;
const BUCKET = "ns-product-images";

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

  // Path-prefixed by tenant slug so uploads are visibly namespaced per
  // tenant inside the shared bucket (tenant-slug/uuid.ext), even though
  // the bucket itself stays public-read for all tenants (same model as
  // before — see the schema.sql note on this bucket's policy).
  const filename = `${tenantSlug}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

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
