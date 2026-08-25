/**
 * Shared with app/[tenant]/admin/actions.ts (products/categories) and
 * app/registro/actions.ts (tenant slugs) — one implementation so a slug
 * always normalizes the same way everywhere it's generated.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
