import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { analyzeProductImage } from "@/lib/ai/analyze-product-image";

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  if (!(await isAdminAuthenticated(tenantSlug))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const imageUrl = body?.imageUrl;
  if (typeof imageUrl !== "string" || !imageUrl) {
    return NextResponse.json({ error: "imageUrl inválido" }, { status: 400 });
  }

  const result = await analyzeProductImage(imageUrl);
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo analizar la imagen." }, { status: 502 });
  }

  return NextResponse.json({ name: result.name, description: result.description });
}
