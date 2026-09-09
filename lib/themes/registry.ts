import type { ThemeMeta, ThemeModule } from "@/lib/themes/types";
import type { ThemeKey } from "@/lib/types/tenant";
import * as Theme01 from "@/components/storefront/themes/theme-01";
import * as Theme02 from "@/components/storefront/themes/theme-02";

/**
 * Every registered Theme, keyed by the string stored in ds_tenants.theme
 * (see lib/repositories/tenant-repository.ts). Adding a Theme means adding
 * one entry here plus its own components/storefront/themes/<key>/ folder —
 * nothing else in the storefront route files needs to change. Typed
 * against ThemeKey (lib/types/tenant.ts), so a Theme value in the data
 * layer with no matching registry entry is a compile error, not a runtime
 * surprise.
 */
export const THEME_REGISTRY: Record<ThemeKey, ThemeModule> = {
  "theme-01": Theme01,
  "theme-02": Theme02,
};

export const DEFAULT_THEME_KEY: ThemeKey = "theme-01";

export const THEME_META: Record<ThemeKey, ThemeMeta> = {
  "theme-01": {
    key: "theme-01",
    label: "Theme 01 — Original",
    description: "El diseño original de DS Catalog: editorial, cálido, orientado a moda y catálogos generales.",
  },
  "theme-02": {
    key: "theme-02",
    label: "Theme 02 — Ferretería y construcción",
    description: "Boutique de herramientas premium: carbón/negro con acentos naranja, orientado a ferreterías, materiales y construcción.",
  },
};

/** Never throws — an unknown/legacy theme value (or a column not yet migrated) falls back to Theme 01, exactly like getBusinessTypeProfile does for business_type. */
export function resolveTheme(themeKey: string | null | undefined): ThemeModule {
  if (themeKey && themeKey in THEME_REGISTRY) return THEME_REGISTRY[themeKey as ThemeKey];
  return THEME_REGISTRY[DEFAULT_THEME_KEY];
}
