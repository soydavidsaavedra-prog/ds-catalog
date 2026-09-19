import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { analyzeProductImage } from "@/lib/ai/analyze-product-image";
import { analyzeProductImageWithGemini } from "@/lib/ai/analyze-product-image-gemini";

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

  // Claude first (better quality); Gemini only covers the specific case
  // where Claude has no key at all — a real Claude failure is reported as
  // such instead of being silently retried on a different provider.
  let result = await analyzeProductImage(imageUrl);
  if (!result.ok && result.reason === "not_configured") {
    result = await analyzeProductImageWithGemini(imageUrl);
  }
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo analizar la imagen." }, { status: 502 });
  }

  return NextResponse.json({ name: result.name, description: result.description });
}
