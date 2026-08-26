import type { CSSProperties } from "react";
import type { SiteSettings } from "@/lib/types/catalog";

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * A tenant with accentColor/accentColorStrong/accentForeground set (either
 * picked from /admin/configuracion, or — for El Nuevo Sánchez — pinned by
 * hand in supabase/schema.sql) gets a scoped CSS custom-property override
 * instead of the platform default (app/globals.css --accent/--accent-
 * strong/--focus-ring, teal). Returns null when the tenant has no
 * override, so callers can skip rendering the <style> tag entirely.
 *
 * Values are validated as strict 6-digit hex before being interpolated —
 * updateSettingsAction already only ever writes valid hex here (native
 * <input type="color"> + readableForegroundFor), but this keeps the CSS
 * injection safe regardless of how a row ended up with these set.
 */
export function buildAccentOverrideCss(settings: SiteSettings): string | null {
  const { accentColor, accentColorStrong, accentForeground } = settings;
  if (!accentColor || !accentColorStrong || !accentForeground) return null;
  if (![accentColor, accentColorStrong, accentForeground].every((c) => HEX_COLOR.test(c))) return null;

  return `:root{--accent:${accentColor};--accent-strong:${accentColorStrong};--accent-foreground:${accentForeground};--focus-ring:${accentColorStrong};}`;
}

/**
 * Same override, but as inline style vars for a scoped element (e.g. the
 * `.tenant-preview` wrapper in app/globals.css) instead of a global
 * :root <style> tag — for previewing a tenant's real accent from inside
 * DS Catalog's own dark platform chrome (see app/[tenant]/admin/layout.tsx,
 * which no longer applies the tenant's accent globally). Returns
 * undefined (not an empty object) when the tenant has no override, so
 * `.tenant-preview`'s own default teal (app/globals.css) shows through
 * unless a caller spreads something else on top.
 */
export function buildAccentOverrideVars(settings: SiteSettings): CSSProperties | undefined {
  const { accentColor, accentColorStrong, accentForeground } = settings;
  if (!accentColor || !accentColorStrong || !accentForeground) return undefined;
  if (![accentColor, accentColorStrong, accentForeground].every((c) => HEX_COLOR.test(c))) return undefined;

  return {
    "--accent": accentColor,
    "--accent-strong": accentColorStrong,
    "--accent-foreground": accentForeground,
    "--focus-ring": accentColorStrong,
  } as CSSProperties;
}

/**
 * Picks black or near-black vs. white as the readable text/icon color to
 * sit on top of `hex`, via WCAG relative luminance — so an admin only has
 * to pick ONE color (their brand's accent) instead of also having to
 * reason about text contrast. Falls back to near-black (safe on most
 * mid-to-light brand colors) for a malformed hex.
 */
export function readableForegroundFor(hex: string): "#0a0a09" | "#ffffff" {
  if (!HEX_COLOR.test(hex)) return "#0a0a09";
  const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((c) => parseInt(c, 16) / 255);
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  // Contrast ratio of black vs. white text against `hex`; pick whichever is higher.
  const contrastWithBlack = (luminance + 0.05) / (0 + 0.05);
  const contrastWithWhite = (1 + 0.05) / (luminance + 0.05);
  return contrastWithBlack >= contrastWithWhite ? "#0a0a09" : "#ffffff";
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
