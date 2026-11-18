import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Suggests a product name + description from its main photo (Claude
 * vision) — the tenant always reviews/edits the result before it's saved,
 * see NSProductAiAssistDialog. Deliberately optional, same pattern as this
 * project's Resend/Vercel Domains wiring (lib/notifications/email.ts):
 * without ANTHROPIC_API_KEY set, this returns a typed "not configured"
 * result instead of throwing, and the button that triggers it is hidden
 * entirely by the caller (see aiAssistEnabled in NSProductForm.tsx) rather
 * than shown broken.
 */

const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `Eres un asistente que ayuda a comerciantes a completar su catálogo de productos a partir de una foto.
Analiza la foto del producto y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después, con esta forma exacta:
{"name": "nombre corto y claro del producto, en español", "description": "descripción breve de 2 a 3 frases para un catálogo en línea, en español"}
No inventes marca, precio ni materiales que no puedas ver claramente en la foto.`;

export type AnalyzeProductImageResult =
  | { ok: true; name: string; description: string }
  | { ok: false; reason: "not_configured" | "api_error" | "parse_error" };

export async function analyzeProductImage(imageUrl: string): Promise<AnalyzeProductImageResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("[ai] ANTHROPIC_API_KEY no configurada — omitiendo análisis de imagen");
    return { ok: false, reason: "not_configured" };
  }

  const client = new Anthropic({ apiKey });

  let text: string;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            { type: "text", text: "Analiza esta foto de producto." },
          ],
        },
      ],
    });
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock) return { ok: false, reason: "parse_error" };
    text = textBlock.text;
  } catch (err) {
    console.error("[ai] fallo al analizar la imagen:", err);
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
