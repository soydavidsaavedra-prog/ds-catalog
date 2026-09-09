import { describe, expect, it } from "vitest";
import { BUSINESS_TYPE_OPTIONS, BUSINESS_TYPE_PROFILES, getBusinessTypeProfile } from "@/lib/tenant/business-type";
import type { BusinessType } from "@/lib/types/tenant";

describe("getBusinessTypeProfile", () => {
  it("returns the matching profile for a known business type", () => {
    expect(getBusinessTypeProfile("ferreteria")).toBe(BUSINESS_TYPE_PROFILES.ferreteria);
  });

  it("falls back to 'moda' for an unrecognized/missing value without throwing", () => {
    expect(getBusinessTypeProfile(undefined as unknown as BusinessType)).toBe(BUSINESS_TYPE_PROFILES.moda);
    expect(getBusinessTypeProfile("no-existe" as BusinessType)).toBe(BUSINESS_TYPE_PROFILES.moda);
  });
});

describe("BUSINESS_TYPE_OPTIONS", () => {
  it("lists every profile exactly once", () => {
    expect(BUSINESS_TYPE_OPTIONS).toHaveLength(Object.keys(BUSINESS_TYPE_PROFILES).length);
    const values = BUSINESS_TYPE_OPTIONS.map((p) => p.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("gives 'otro' an empty starter-category list (blank slate)", () => {
    expect(BUSINESS_TYPE_PROFILES.otro.starterCategories).toEqual([]);
  });
});
