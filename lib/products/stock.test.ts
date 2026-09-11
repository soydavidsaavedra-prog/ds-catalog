import { describe, expect, it } from "vitest";
import { LOW_STOCK_THRESHOLD, applyStockDecrement, deriveAvailabilityFromStock } from "./stock";

describe("deriveAvailabilityFromStock", () => {
  it("is out_of_stock at zero", () => {
    expect(deriveAvailabilityFromStock(0)).toBe("out_of_stock");
  });

  it("is out_of_stock for a negative number too", () => {
    expect(deriveAvailabilityFromStock(-1)).toBe("out_of_stock");
  });

  it("is low_stock at and below the threshold", () => {
    expect(deriveAvailabilityFromStock(LOW_STOCK_THRESHOLD)).toBe("low_stock");
    expect(deriveAvailabilityFromStock(1)).toBe("low_stock");
  });

  it("is in_stock above the threshold", () => {
    expect(deriveAvailabilityFromStock(LOW_STOCK_THRESHOLD + 1)).toBe("in_stock");
    expect(deriveAvailabilityFromStock(100)).toBe("in_stock");
  });
});

describe("applyStockDecrement", () => {
  it("subtracts the ordered quantity", () => {
    expect(applyStockDecrement(10, 3)).toBe(7);
  });

  it("never goes below zero when the order exceeds what's left", () => {
    expect(applyStockDecrement(2, 5)).toBe(0);
  });

  it("handles decrementing to exactly zero", () => {
    expect(applyStockDecrement(4, 4)).toBe(0);
  });
});
