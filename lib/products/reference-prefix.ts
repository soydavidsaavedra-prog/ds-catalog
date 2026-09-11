/**
 * Every tenant's auto-generated product reference used to be hardcoded as
 * "NS-001", "NS-002", ... — "NS" for "El Nuevo Sanchez", this platform's
 * first tenant, baked in back when there was only one and never
 * generalized. Now each tenant gets a prefix derived from their own
 * business name instead (see getNextReference in
 * lib/repositories/product-repository.ts, the only caller).
 */

const SPANISH_CONNECTOR_WORDS = new Set(["el", "la", "los", "las", "de", "del", "y", "e"]);

/**
 * "El Nuevo Sanchez" -> "NS" (skips short connector words, landing on the
 * exact prefix this platform used to hardcode for that tenant); "Ferretería
 * El Tornillo" -> "FT"; "Demo" -> "DEM". Always 2-4 uppercase letters.
 */
export function deriveReferencePrefix(businessName: string): string {
  const words = businessName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const meaningful = words.filter((w) => !SPANISH_CONNECTOR_WORDS.has(w));
  const chosen = meaningful.length > 0 ? meaningful : words;
  if (chosen.length === 0) return "PROD";

  const initials = chosen.map((w) => w[0]!.toUpperCase()).join("");
  if (initials.length >= 2) return initials.slice(0, 4);

  // A single short word (e.g. "Demo") makes for a 1-letter, ambiguous
  // prefix — use more letters from that word instead.
  return chosen[0]!.slice(0, 3).toUpperCase();
}

/**
 * Whatever prefix this tenant's own products already use, detected from an
 * actual reference (e.g. "NS-003" -> "NS"). Reusing it keeps numbering
 * continuous instead of colliding with an existing reference or restarting
 * at 1 the moment a tenant's derived prefix would come out different from
 * what their earlier products already carry (e.g. after a name edit, or
 * simply because every tenant's products were "NS-..." before this existed).
 */
export function detectExistingReferencePrefix(references: string[]): string | null {
  for (const reference of references) {
    const match = /^([A-Z0-9]+)-\d+$/.exec(reference.trim());
    if (match) return match[1]!;
  }
  return null;
}
