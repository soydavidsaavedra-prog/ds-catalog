import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAuthenticatedSuperadmin } from "@/lib/auth/superadmin-auth";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import { DS_STUDIO_APKS_BUCKET } from "@/lib/media/parking-apk-bucket";
import { MAX_APK_UPLOAD_BYTES } from "@/lib/media/parking-apk-limits";

/**
 * Issues a short-lived Supabase Storage signed upload URL instead of
 * proxying the APK's bytes through this route — an APK is routinely
 * 10-100+MB, far past Vercel's ~4.5MB request-body ceiling for serverless
 * functions (see lib/media/upload-limits.ts's comment on the same limit
 * for the per-tenant image/video upload route). The browser PUTs the file
 * straight to the signedUrl this returns, never touching a Next.js route
 * for the large transfer — see NSParkingApkUploadForm for the client side.
 */
export async function POST(request: Request) {
  const superadmin = await getAuthenticatedSuperadmin();
  if (!superadmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const fileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;

  if (!fileName.toLowerCase().endsWith(".apk")) {
    return NextResponse.json({ error: "El archivo debe ser un .apk" }, { status: 400 });
  }
  if (!(fileSize > 0 && fileSize <= MAX_APK_UPLOAD_BYTES)) {
    return NextResponse.json(
      { error: `El archivo debe pesar menos de ${Math.round(MAX_APK_UPLOAD_BYTES / (1024 * 1024))}MB` },
      { status: 400 },
    );
  }

  const path = `apk/${Date.now()}-${randomUUID()}.apk`;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(DS_STUDIO_APKS_BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo preparar la subida" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, path });
}
