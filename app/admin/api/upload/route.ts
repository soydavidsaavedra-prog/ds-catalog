import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { getSupabaseClient } from "@/lib/db/supabaseClient";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_SIZE = 8 * 1024 * 1024;
const BUCKET = "product-images";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Formato no soportado (usa JPG, PNG, WEBP o AVIF)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera 8MB" }, { status: 400 });
  }

  const extension = file.type.split("/")[1];
  const filename = `${randomUUID()}.${extension}`;
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
