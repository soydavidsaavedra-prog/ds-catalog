import { afterEach, describe, expect, it, vi } from "vitest";

const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));
vi.mock("@/lib/db/supabaseClient", () => ({
  getSupabaseClient: () => ({ storage: { from: () => ({ list: listMock, remove: vi.fn() }) } }),
}));

const { listProducts } = vi.hoisted(() => ({ listProducts: vi.fn() }));
vi.mock("@/lib/repositories/product-repository", () => ({ listProducts }));

const { listBanners } = vi.hoisted(() => ({ listBanners: vi.fn() }));
vi.mock("@/lib/repositories/banner-repository", () => ({ listBanners }));

const { listCategories } = vi.hoisted(() => ({ listCategories: vi.fn() }));
vi.mock("@/lib/repositories/category-repository", () => ({ listCategories }));

const { listHeroSlides } = vi.hoisted(() => ({ listHeroSlides: vi.fn() }));
vi.mock("@/lib/repositories/hero-slide-repository", () => ({ listHeroSlides }));

const { getSettings } = vi.hoisted(() => ({ getSettings: vi.fn() }));
vi.mock("@/lib/repositories/settings-repository", () => ({ getSettings }));

const { listOrders } = vi.hoisted(() => ({ listOrders: vi.fn() }));
vi.mock("@/lib/repositories/order-repository", () => ({ listOrders }));

vi.mock("@/lib/repositories/tenant-repository", () => ({ listAllTenants: vi.fn() }));

import { findOrphanedFilesForTenant } from "@/lib/repositories/storage-repository";
import type { Product } from "@/lib/types/catalog";
import type { Order } from "@/lib/types/order";
import type { SiteSettings } from "@/lib/types/catalog";

const TENANT_ID = "tenant-1";
const TENANT_SLUG = "ferreteria-central";

function publicUrl(path: string): string {
  return `https://project.supabase.co/storage/v1/object/public/ns-product-images/${path}`;
}

function storageEntry(name: string, sizeBytes: number) {
  return { id: "obj-id", name, metadata: { size: sizeBytes } };
}

function emptySettings(): SiteSettings {
  return {
    brandName: "",
    slogan: "",
    brandDescription: "",
    whatsappNumber: "",
    whatsappDisplay: "",
    contactEmail: "",
    contactAddress: "",
    contactMapsUrl: "",
    currency: "USD",
    instagram: "",
    facebook: "",
    tiktok: "",
    heroEyebrow: "",
    heroTitleLine1: "",
    heroTitleLine2: "",
    heroSubtitle: "",
    heroTagline: "",
    heroCtaLabel: "",
    heroCtaHref: "",
    heroImage: "",
    heroImagePositionX: 50,
    heroImagePositionY: 50,
    brandLogo: "",
    paymentBadgeIcon: "",
    paymentBadgeLabel: "",
    storyEyebrow: "",
    storyTitle: "",
    storyDescription: "",
    storyStepImage1: "",
    storyStepImage2: "",
    storyStepImage3: "",
    storyStepImage4: "",
    storyStepImage5: "",
    statementTitleLine1: "",
    statementTitleLine2: "",
    statementDescription: "",
    statementImage: "",
    accentColor: null,
    accentColorStrong: null,
    accentForeground: null,
    storyStepLabel1: null,
    storyStepLabel2: null,
    storyStepLabel3: null,
    storyStepLabel4: null,
    storyStepLabel5: null,
    termsContent: "",
    privacyContent: "",
  };
}

function emptyOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    createdAt: "2024-01-01T00:00:00.000Z",
    items: [],
    total: 0,
    customerName: null,
    customerPhone: null,
    status: "new",
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("findOrphanedFilesForTenant", () => {
  it("does not flag a file still referenced by a product", async () => {
    listMock.mockResolvedValue({
      data: [storageEntry("in-use.jpg", 1000), storageEntry("orphan.jpg", 2000)],
      error: null,
    });
    listProducts.mockResolvedValue([
      { images: [publicUrl(`${TENANT_SLUG}/in-use.jpg`)] } as Product,
    ]);
    listBanners.mockResolvedValue([]);
    listCategories.mockResolvedValue([]);
    listHeroSlides.mockResolvedValue([]);
    getSettings.mockResolvedValue(emptySettings());
    listOrders.mockResolvedValue([]);

    const orphans = await findOrphanedFilesForTenant(TENANT_ID, TENANT_SLUG);

    expect(orphans.map((o) => o.path)).toEqual([`${TENANT_SLUG}/orphan.jpg`]);
  });

  it("does not flag a file only referenced by a past order's item snapshot, even after the product no longer uses it", async () => {
    listMock.mockResolvedValue({
      data: [storageEntry("old-product-photo.jpg", 500)],
      error: null,
    });
    // The product itself moved on to a different photo...
    listProducts.mockResolvedValue([{ images: [publicUrl(`${TENANT_SLUG}/new-photo.jpg`)] } as Product]);
    listBanners.mockResolvedValue([]);
    listCategories.mockResolvedValue([]);
    listHeroSlides.mockResolvedValue([]);
    getSettings.mockResolvedValue(emptySettings());
    // ...but an old order still snapshots the original photo.
    listOrders.mockResolvedValue([
      emptyOrder({
        items: [
          {
            productId: "p1",
            reference: "REF-1",
            name: "Producto",
            image: publicUrl(`${TENANT_SLUG}/old-product-photo.jpg`),
            slug: "producto",
            size: null,
            color: null,
            quantity: 1,
            price: 10,
          },
        ],
      }),
    ]);

    const orphans = await findOrphanedFilesForTenant(TENANT_ID, TENANT_SLUG);

    expect(orphans).toEqual([]);
  });

  it("does not flag files referenced by settings image fields", async () => {
    listMock.mockResolvedValue({
      data: [storageEntry("logo.jpg", 100), storageEntry("hero.jpg", 200)],
      error: null,
    });
    listProducts.mockResolvedValue([]);
    listBanners.mockResolvedValue([]);
    listCategories.mockResolvedValue([]);
    listHeroSlides.mockResolvedValue([]);
    getSettings.mockResolvedValue({
      ...emptySettings(),
      brandLogo: publicUrl(`${TENANT_SLUG}/logo.jpg`),
      heroImage: publicUrl(`${TENANT_SLUG}/hero.jpg`),
    });
    listOrders.mockResolvedValue([]);

    const orphans = await findOrphanedFilesForTenant(TENANT_ID, TENANT_SLUG);

    expect(orphans).toEqual([]);
  });

  it("flags a file with zero references anywhere as orphaned, with its size intact", async () => {
    listMock.mockResolvedValue({ data: [storageEntry("abandoned-upload.jpg", 4096)], error: null });
    listProducts.mockResolvedValue([]);
    listBanners.mockResolvedValue([]);
    listCategories.mockResolvedValue([]);
    listHeroSlides.mockResolvedValue([]);
    getSettings.mockResolvedValue(emptySettings());
    listOrders.mockResolvedValue([]);

    const orphans = await findOrphanedFilesForTenant(TENANT_ID, TENANT_SLUG);

    expect(orphans).toEqual([{ path: `${TENANT_SLUG}/abandoned-upload.jpg`, sizeBytes: 4096 }]);
  });

  it("ignores placeholder markers and empty strings instead of matching them to a real file", async () => {
    listMock.mockResolvedValue({ data: [storageEntry("real-file.jpg", 100)], error: null });
    listProducts.mockResolvedValue([{ images: ["placeholder:herramientas:1", ""] } as unknown as Product]);
    listBanners.mockResolvedValue([]);
    listCategories.mockResolvedValue([{ image: "placeholder:herramientas:1" } as never]);
    listHeroSlides.mockResolvedValue([]);
    getSettings.mockResolvedValue(emptySettings());
    listOrders.mockResolvedValue([]);

    const orphans = await findOrphanedFilesForTenant(TENANT_ID, TENANT_SLUG);

    expect(orphans.map((o) => o.path)).toEqual([`${TENANT_SLUG}/real-file.jpg`]);
  });
});
