/**
 * Media Engine — placeholder art.
 *
 * Real product photography isn't available yet for the demo catalog, so
 * every seed product points at "placeholder:<category>:<seed>" instead of
 * a URL. NSPlaceholderArt renders that token as a designed denim/industrial
 * plate (gradient + stitch lines + monogram) so the catalog reads as an
 * intentional editorial layout instead of broken images. The moment the
 * admin uploads a real photo, the product's images[0] becomes a normal URL
 * and NSMedia renders it with next/image instead — no component changes
 * needed anywhere else.
 */

export interface ParsedPlaceholder {
  category: string;
  seed: string;
}

export function parsePlaceholder(src: string): ParsedPlaceholder | null {
  if (!src.startsWith("placeholder:")) return null;
  const [, category = "otros", seed = "0"] = src.split(":");
  return { category, seed };
}

const VARIANTS = [
  { from: "#17263a", to: "#0f1a28" }, // denim-800 -> denim-900
  { from: "#233a55", to: "#121110" }, // denim-700 -> ink-900
  { from: "#302e2c", to: "#0a0a09" }, // ink-700 -> ink-950
  { from: "#2f4d6f", to: "#17263a" }, // denim-600 -> denim-800
];

export function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function placeholderVariant(seed: string) {
  const hash = hashSeed(seed);
  return VARIANTS[hash % VARIANTS.length];
}
