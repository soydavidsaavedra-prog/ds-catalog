import "server-only";
import type { AnalyzeProductImageResult } from "./analyze-product-image";

/**
 * Free fallback engine for "Sugerir con IA" when ANTHROPIC_API_KEY isn't
 * configured — Google's Gemini API has a genuinely free tier (no card
 * required, see https://aistudio.google.com/apikey). Plain `fetch` to the
 * REST API, same lightweight style as lib/notifications/email.ts's Resend
 * call, rather than adding a new SDK dependency. Same optional/graceful
 * pattern: without GEMINI_API_KEY, returns a typed "not configured" result
 * instead of throwing.
 *
 * Model IDs across any AI provider drift over time and can't be verified
 * live from here — if "gemini-2.0-flash" is ever retired, calls fail loudly
 * as a plain api_error in the server logs, fixed by updating this one
 * constant.
 */

const MODEL = "gemini-2.0-flash";

const PROMPT = `Eres un asistente que ayuda a comerciantes a completar su catálogo de productos a partir de una foto.
Analiza la foto del producto y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después, con esta forma exacta:
{"name": "nombre corto y claro del producto, en español", "description": "descripción breve de 2 a 3 frases para un catálogo en línea, en español"}
No inventes marca, precio ni materiales que no puedas ver claramente en la foto.`;

export async function analyzeProductImageWithGemini(imageUrl: string): Promise<AnalyzeProductImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[ai] GEMINI_API_KEY no configurada — omitiendo análisis de imagen");
    return { ok: false, reason: "not_configured" };
  }

  let text: string;
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return { ok: false, reason: "api_error" };
    const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const base64 = Buffer.from(await imageRes.arrayBuffer()).toString("base64");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: PROMPT }],
            },
          ],
        }),
      },
    );
    if (!res.ok) {
      console.error("[ai] Gemini respondió con error:", res.status, await res.text().catch(() => ""));
      return { ok: false, reason: "api_error" };
    }
    const data = await res.json();
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) return { ok: false, reason: "parse_error" };
  } catch (err) {
    console.error("[ai] fallo al analizar la imagen con Gemini:", err);
    return { ok: false, reason: "api_error" };
  }

  try {
    const parsed = JSON.parse(text) as { name?: unknown; description?: unknown };
    if (typeof parsed.name !== "string" || typeof parsed.description !== "string") {
      return { ok: false, reason: "parse_error" };
    }
    return { ok: true, name: parsed.name, description: parsed.description };
  } catch {
    return { ok: false, reason: "parse_error" };
  }
}
