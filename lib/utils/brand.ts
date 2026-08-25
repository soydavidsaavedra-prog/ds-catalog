/** "El Nuevo Sánchez" -> "NS", "Demo Store" -> "DS", "Acme" -> "AC". */
export function brandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
