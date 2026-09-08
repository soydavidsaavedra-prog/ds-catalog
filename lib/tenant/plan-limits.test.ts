import { afterEach, describe, expect, it, vi } from "vitest";

const { getSubscriptionByTenantId } = vi.hoisted(() => ({ getSubscriptionByTenantId: vi.fn() }));
vi.mock("@/lib/repositories/subscriptions-repository", () => ({ getSubscriptionByTenantId }));

const { getPlanById } = vi.hoisted(() => ({ getPlanById: vi.fn() }));
vi.mock("@/lib/repositories/plans-repository", () => ({ getPlanById }));

import { EXPIRY_WARNING_DAYS, getEffectivePlanForTenant, getPlanStatusInfo } from "@/lib/tenant/plan-limits";
import type { Subscription } from "@/lib/repositories/subscriptions-repository";

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub-1",
    tenantId: "tenant-1",
    planId: "plan-1",
    status: "active",
    requestedPlanId: null,
    startedAt: "2024-01-01T00:00:00.000Z",
    expiresAt: null,
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("getEffectivePlanForTenant", () => {
  it("returns null when the tenant has no subscription at all (unlimited by default)", async () => {
    getSubscriptionByTenantId.mockResolvedValue(null);
    expect(await getEffectivePlanForTenant("tenant-1")).toBeNull();
    expect(getPlanById).not.toHaveBeenCalled();
  });

  it("looks up the subscription's own plan when one exists", async () => {
    getSubscriptionByTenantId.mockResolvedValue(makeSubscription({ planId: "plan-pro" }));
    getPlanById.mockResolvedValue({ id: "plan-pro" });
    const plan = await getEffectivePlanForTenant("tenant-1");
    expect(getPlanById).toHaveBeenCalledWith("plan-pro");
    expect(plan).toEqual({ id: "plan-pro" });
  });
});

describe("getPlanStatusInfo", () => {
  it("is never frozen when there is no subscription", async () => {
    getSubscriptionByTenantId.mockResolvedValue(null);
    expect(await getPlanStatusInfo("tenant-1")).toEqual({ freezeReason: null, expiresAt: null, daysUntilExpiry: null });
  });

  it("freezes as 'pending' for a self-registered tenant awaiting approval", async () => {
    getSubscriptionByTenantId.mockResolvedValue(makeSubscription({ status: "pending" }));
    const info = await getPlanStatusInfo("tenant-1");
    expect(info.freezeReason).toBe("pending");
  });

  it("freezes as 'cancelled'", async () => {
    getSubscriptionByTenantId.mockResolvedValue(makeSubscription({ status: "cancelled" }));
    expect((await getPlanStatusInfo("tenant-1")).freezeReason).toBe("cancelled");
  });

  it("freezes as 'expired' once expiresAt is in the past, even if status still says active", async () => {
    getSubscriptionByTenantId.mockResolvedValue(
      makeSubscription({ status: "active", expiresAt: "2020-01-01T00:00:00.000Z" }),
    );
    const info = await getPlanStatusInfo("tenant-1");
    expect(info.freezeReason).toBe("expired");
    expect(info.daysUntilExpiry).toBeNull();
  });

  it("is not frozen and reports days remaining when expiresAt is in the future", async () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    getSubscriptionByTenantId.mockResolvedValue(makeSubscription({ status: "active", expiresAt: future }));
    const info = await getPlanStatusInfo("tenant-1");
    expect(info.freezeReason).toBeNull();
    expect(info.daysUntilExpiry).toBeGreaterThanOrEqual(2);
    expect(info.daysUntilExpiry).toBeLessThanOrEqual(3);
  });

  it("is not frozen when there is no expiresAt at all (e.g. trial without a fixed end)", async () => {
    getSubscriptionByTenantId.mockResolvedValue(makeSubscription({ status: "trial", expiresAt: null }));
    const info = await getPlanStatusInfo("tenant-1");
    expect(info.freezeReason).toBeNull();
    expect(info.daysUntilExpiry).toBeNull();
  });

  it("does not freeze 'paused' on its own (billing-tracking pause, not access freeze)", async () => {
    getSubscriptionByTenantId.mockResolvedValue(makeSubscription({ status: "paused" }));
    expect((await getPlanStatusInfo("tenant-1")).freezeReason).toBeNull();
  });
});

describe("EXPIRY_WARNING_DAYS", () => {
  it("is a positive number of days", () => {
    expect(EXPIRY_WARNING_DAYS).toBeGreaterThan(0);
  });
});
