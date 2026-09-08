import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/utils/slug";
import { RESERVED_SLUGS } from "@/lib/utils/reserved-slugs";

describe("slugify", () => {
  it("lowercases and strips accents", () => {
    expect(slugify("Ferretería El Sánchez")).toBe("ferreteria-el-sanchez");
  });

  it("replaces non-alphanumeric runs with a single dash", () => {
    expect(slugify("Café & Co.!!")).toBe("cafe-co");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  --Hola Mundo--  ")).toBe("hola-mundo");
  });

  it("handles an already-clean slug as a no-op", () => {
    expect(slugify("ya-es-un-slug")).toBe("ya-es-un-slug");
  });

  it("collapses to an empty string for input with no alphanumerics", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("RESERVED_SLUGS", () => {
  it("blocks every top-level static route", () => {
    expect(RESERVED_SLUGS.has("registro")).toBe(true);
    expect(RESERVED_SLUGS.has("acceder")).toBe(true);
    expect(RESERVED_SLUGS.has("superadmin")).toBe(true);
  });

  it("does not block an ordinary tenant slug", () => {
    expect(RESERVED_SLUGS.has("ferreteria-central")).toBe(false);
  });
});
