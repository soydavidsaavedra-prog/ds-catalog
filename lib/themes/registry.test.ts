import { describe, expect, it } from "vitest";
import { DEFAULT_THEME_KEY, resolveTheme, THEME_META, THEME_REGISTRY } from "@/lib/themes/registry";

describe("resolveTheme", () => {
  it("resolves a known theme key to its own module", () => {
    expect(resolveTheme("theme-02")).toBe(THEME_REGISTRY["theme-02"]);
  });

  it("falls back to the default theme for null, undefined, empty, or unknown values", () => {
    const fallback = THEME_REGISTRY[DEFAULT_THEME_KEY];
    expect(resolveTheme(null)).toBe(fallback);
    expect(resolveTheme(undefined)).toBe(fallback);
    expect(resolveTheme("")).toBe(fallback);
    expect(resolveTheme("theme-that-does-not-exist")).toBe(fallback);
    expect(resolveTheme("theme-ferrecol")).toBe(fallback);
  });

  it("never throws regardless of input", () => {
    expect(() => resolveTheme("<script>alert(1)</script>")).not.toThrow();
  });
});

describe("THEME_META", () => {
  it("has a metadata entry for every registered theme, and vice versa", () => {
    expect(Object.keys(THEME_META).sort()).toEqual(Object.keys(THEME_REGISTRY).sort());
  });

  it("keeps each entry's own key consistent with its map key", () => {
    for (const [key, meta] of Object.entries(THEME_META)) {
      expect(meta.key).toBe(key);
    }
  });
});
