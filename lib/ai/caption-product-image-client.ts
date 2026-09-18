"use client";

/**
 * Free fallback for "Sugerir con IA" when the server has no
 * ANTHROPIC_API_KEY configured — runs a small image-captioning model
 * entirely in the browser via transformers.js/ONNX, same approach as
 * "Quitar fondo" (lib/media/background-removal.ts): no account, no API
 * key, no server involvement, model weights fetched lazily from Hugging
 * Face's CDN on first use only (dynamic import, never in the initial
 * bundle).
 *
 * Real trade-off, accepted by the tenant seeing the result before saving
 * anything: the model (vit-gpt2-image-captioning) is English-only and
 * produces a literal caption ("a red shirt on a hanger"), not sales copy
 * — there's no free/reliable translation available here, so the name and
 * description below are derived straight from that English caption.
 */
export async function captionProductImageLocally(imageUrl: string): Promise<{ name: string; description: string }> {
  const { pipeline } = await import("@huggingface/transformers");
  const captioner = await pipeline("image-to-text", "Xenova/vit-gpt2-image-captioning", { dtype: "q8" });
  const output = await captioner(imageUrl);
  const result = Array.isArray(output) ? output[0] : output;
  const caption = String((result as { generated_text?: string })?.generated_text ?? "").trim();
  if (!caption) throw new Error("No se pudo generar una descripción de la imagen");

  return { name: deriveName(caption), description: deriveDescription(caption) };
}

function deriveName(caption: string): string {
  const withoutArticle = caption.replace(/^(a|an|the)\s+/i, "");
  const words = withoutArticle.split(/\s+/).slice(0, 5);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function deriveDescription(caption: string): string {
  const sentence = caption.charAt(0).toUpperCase() + caption.slice(1);
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}
