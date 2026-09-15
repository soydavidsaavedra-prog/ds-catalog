import { describe, expect, it } from "vitest";
import { buildCatalogPdf, groupProductsByCategory, isSupportedRasterImage } from "@/lib/catalog-pdf/build-catalog-pdf";
import type { Category, Product, SiteSettings } from "@/lib/types/catalog";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "1",
    slug: "producto-1",
    reference: "REF-1",
    name: "Producto 1",
    price: 100,
    previousPrice: null,
    description: "",
    categorySlug: "herramientas",
    audience: "unisex",
    images: [],
    cardAspectRatio: "portrait",
    imageFit: "cover",
    sizes: [],
    colors: [],
    availability: "in_stock",
    featured: false,
    isNew: false,
    onSale: false,
    active: true,
    hidePaymentBadge: false,
    stock: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-1",
    slug: "herramientas",
    name: "Herramientas",
    description: "",
    image: "",
    order: 0,
    active: true,
    featured: false,
    parentId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeSettings(overrides: Partial<SiteSettings> = {}): SiteSettings {
  return {
    brandName: "Mi Tienda",
    slogan: "",
    brandDescription: "",
    whatsappNumber: "",
    whatsappDisplay: "",
    contactEmail: "",
    contactAddress: "",
    contactMapsUrl: "",
    currency: "COP",
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
    storyStepLabel1: null,
    storyStepLabel2: null,
    storyStepLabel3: null,
    storyStepLabel4: null,
    storyStepLabel5: null,
    statementTitleLine1: "",
    statementTitleLine2: "",
    statementDescription: "",
    statementImage: "",
    accentColor: null,
    accentColorStrong: null,
    accentForeground: null,
    termsContent: "",
    privacyContent: "",
    ...overrides,
  };
}

describe("isSupportedRasterImage", () => {
  it("recognizes JPEG magic bytes", () => {
    expect(isSupportedRasterImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
  });

  it("recognizes PNG magic bytes", () => {
    expect(isSupportedRasterImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]))).toBe(true);
  });

  it("rejects anything else (webp/avif/svg/garbage)", () => {
    expect(isSupportedRasterImage(Buffer.from("RIFF....WEBP"))).toBe(false);
    expect(isSupportedRasterImage(Buffer.from("<svg></svg>"))).toBe(false);
    expect(isSupportedRasterImage(Buffer.from([]))).toBe(false);
  });
});

describe("groupProductsByCategory", () => {
  const categories = [makeCategory({ slug: "herramientas", name: "Herramientas" }), makeCategory({ slug: "pintura", name: "Pintura" })];

  it("groups products under their matching category, preserving first-seen order", () => {
    const products = [
      makeProduct({ id: "1", categorySlug: "pintura" }),
      makeProduct({ id: "2", categorySlug: "herramientas" }),
      makeProduct({ id: "3", categorySlug: "pintura" }),
    ];
    const groups = groupProductsByCategory(products, categories);
    expect(groups.map((g) => g.category?.slug)).toEqual(["pintura", "herramientas"]);
    expect(groups[0].products.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("buckets products whose category no longer exists under a null 'Otros' group", () => {
    const products = [makeProduct({ id: "1", categorySlug: "descontinuada" })];
    const groups = groupProductsByCategory(products, categories);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBeNull();
  });
});

describe("buildCatalogPdf", () => {
  it("produces a valid PDF buffer for products with no real photos (no network calls)", async () => {
    const settings = makeSettings({ brandName: "Ferretería Central" });
    const categories = [makeCategory()];
    const products = [
      makeProduct({ id: "1", name: "Martillo", images: ["placeholder:herramientas:1"] }),
      makeProduct({ id: "2", name: "Taladro", previousPrice: 200, price: 150, sizes: ["Único"], colors: [{ name: "Rojo", hex: "#ff0000" }] }),
    ];

    const pdf = await buildCatalogPdf({ settings, categories, products });
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(500);
  });

  it("still produces a valid (near-empty) PDF when there are no products", async () => {
    const pdf = await buildCatalogPdf({ settings: makeSettings(), categories: [], products: [] });
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
