import { describe, expect, it } from "vitest";
import { deriveReferencePrefix, detectExistingReferencePrefix } from "./reference-prefix";

describe("deriveReferencePrefix", () => {
  it("derives NS from El Nuevo Sanchez, matching this platform's original hardcoded prefix", () => {
    expect(deriveReferencePrefix("El Nuevo Sanchez")).toBe("NS");
  });

  it("skips short Spanish connector words", () => {
    expect(deriveReferencePrefix("Ferretería El Tornillo")).toBe("FT");
  });

  it("falls back to the first letters of a single short word", () => {
    expect(deriveReferencePrefix("Demo")).toBe("DEM");
  });

  it("caps the prefix at 4 letters for a long business name", () => {
    expect(deriveReferencePrefix("Almacen Central De Repuestos Automotrices")).toHaveLength(4);
  });

  it("is accent- and case-insensitive", () => {
    expect(deriveReferencePrefix("cafetería áurea")).toBe("CA");
  });

  it("falls back to PROD when the name has no usable characters", () => {
    expect(deriveReferencePrefix("!!!")).toBe("PROD");
  });
});

describe("detectExistingReferencePrefix", () => {
  it("detects the prefix from the first reference that matches", () => {
    expect(detectExistingReferencePrefix(["NS-001", "NS-002"])).toBe("NS");
  });

  it("skips a reference that doesn't match the PREFIX-digits shape", () => {
    expect(detectExistingReferencePrefix(["not-a-match", "FT-005"])).toBe("FT");
  });

  it("returns null when nothing matches (a brand new tenant with no products)", () => {
    expect(detectExistingReferencePrefix([])).toBeNull();
    expect(detectExistingReferencePrefix(["custom-ref-1"])).toBeNull();
  });
});
