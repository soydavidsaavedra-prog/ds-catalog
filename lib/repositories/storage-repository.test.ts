import { describe, expect, it } from "vitest";
import { deriveGlobalStorageUsage, type TenantStorageUsage } from "@/lib/repositories/storage-repository";

function makeUsage(overrides: Partial<TenantStorageUsage>): TenantStorageUsage {
  return {
    tenantId: "t1",
    tenantSlug: "tenant",
    tenantName: "Tenant",
    fileCount: 0,
    totalBytes: 0,
    ...overrides,
  };
}

describe("deriveGlobalStorageUsage", () => {
  it("sums bytes and file counts across every tenant", () => {
    const usage = [
      makeUsage({ tenantId: "1", fileCount: 3, totalBytes: 1000 }),
      makeUsage({ tenantId: "2", fileCount: 5, totalBytes: 2500 }),
    ];
    expect(deriveGlobalStorageUsage(usage)).toEqual({ totalBytes: 3500, totalFiles: 8 });
  });

  it("returns zeros for an empty tenant list", () => {
    expect(deriveGlobalStorageUsage([])).toEqual({ totalBytes: 0, totalFiles: 0 });
  });
});
