import { describe, expect, it } from "vitest";
import { findDuplicateProduct, normalizeForDuplicateCheck } from "./duplicates";

describe("normalizeForDuplicateCheck", () => {
  it("trims and lowercases", () => {
    expect(normalizeForDuplicateCheck("  Camisa Azul  ")).toBe("camisa azul");
  });
});

describe("findDuplicateProduct", () => {
  const existing = [
    { id: "p1", name: "Camisa Azul", reference: "NS-001" },
    { id: "p2", name: "Pantalón Negro", reference: "NS-002" },
  ];

  it("finds a match by reference regardless of case/whitespace", () => {
    const match = findDuplicateProduct(existing, { name: "Otro nombre", reference: "  ns-001  " });
    expect(match?.id).toBe("p1");
  });

  it("finds a match by name regardless of case/whitespace", () => {
    const match = findDuplicateProduct(existing, { name: "  camisa azul  ", reference: "NS-999" });
    expect(match?.id).toBe("p1");
  });

  it("returns null when neither name nor reference match", () => {
    const match = findDuplicateProduct(existing, { name: "Falda Roja", reference: "NS-003" });
    expect(match).toBeNull();
  });

  it("excludes the given id so editing a product doesn't flag itself", () => {
    const match = findDuplicateProduct(existing, { name: "Camisa Azul", reference: "NS-001" }, "p1");
    expect(match).toBeNull();
  });

  it("still flags a different product when excludeId doesn't match it", () => {
    const match = findDuplicateProduct(existing, { name: "Camisa Azul", reference: "NS-001" }, "p2");
    expect(match?.id).toBe("p1");
  });
});
