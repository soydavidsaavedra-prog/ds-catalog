import type { SiteSettings } from "@/lib/types/catalog";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * A tenant with accentColor/accentColorStrong/accentForeground set (today,
 * only El Nuevo Sánchez — see supabase/schema.sql) gets a scoped CSS
 * custom-property override instead of the platform default (app/globals.css
 * --accent/--accent-strong/--focus-ring, teal). Returns null when the
 * tenant has no override, so callers can skip rendering the <style> tag
 * entirely.
 *
 * Values are validated as strict 6-digit hex before being interpolated —
 * these columns have no edit UI yet (only ever set by hand via SQL), but
 * this keeps it safe if/when a settings form writes to them later.
 */
export function buildAccentOverrideCss(settings: SiteSettings): string | null {
  const { accentColor, accentColorStrong, accentForeground } = settings;
  if (!accentColor || !accentColorStrong || !accentForeground) return null;
  if (![accentColor, accentColorStrong, accentForeground].every((c) => HEX_COLOR.test(c))) return null;

  return `:root{--accent:${accentColor};--accent-strong:${accentColorStrong};--accent-foreground:${accentForeground};--focus-ring:${accentColorStrong};}`;
}

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
