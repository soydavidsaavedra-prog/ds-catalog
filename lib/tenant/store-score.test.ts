import { describe, expect, it } from "vitest";
import { computeStoreScore } from "@/lib/tenant/store-score";
import type { Category, HeroSlide, Product, SiteSettings } from "@/lib/types/catalog";

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
    heroCtaHref: "/catalogo",
    heroImage: "placeholder:hero:1",
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
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "producto-1",
    reference: "REF-001",
    name: "Producto 1",
    price: 10,
    previousPrice: null,
    description: "",
    categorySlug: "general",
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

const noCategories: Category[] = [];
const noHeroSlides: HeroSlide[] = [];

describe("computeStoreScore", () => {
  it("scores 0 when nothing has been configured", () => {
    const result = computeStoreScore({
      settings: makeSettings(),
      products: [],
      categories: noCategories,
      heroSlides: noHeroSlides,
    });
    expect(result.score).toBe(0);
    expect(result.criteria.every((c) => !c.done)).toBe(true);
  });

  it("scores 100 when every real criterion is satisfied", () => {
    const result = computeStoreScore({
      settings: makeSettings({
        brandLogo: "https://cdn.example.com/logo.png",
        accentColor: "#ff0000",
        whatsappNumber: "584121234567",
        contactEmail: "hola@mitienda.com",
        heroImage: "https://cdn.example.com/hero.png",
      }),
      products: [makeProduct({ images: ["https://cdn.example.com/product.png"] })],
      categories: [
        { id: "c1", slug: "general", name: "General", description: "", image: "", order: 0, active: true, featured: true, parentId: null, createdAt: "", updatedAt: "" },
      ],
      heroSlides: noHeroSlides,
    });
    expect(result.score).toBe(100);
    expect(result.criteria.every((c) => c.done)).toBe(true);
  });

  it("does not count a placeholder logo/hero as configured", () => {
    const result = computeStoreScore({
      settings: makeSettings({ brandLogo: "placeholder:logo:1", heroImage: "placeholder:hero:1" }),
      products: [],
      categories: noCategories,
      heroSlides: noHeroSlides,
    });
    const logo = result.criteria.find((c) => c.id === "logo");
    const hero = result.criteria.find((c) => c.id === "hero");
    expect(logo?.done).toBe(false);
    expect(hero?.done).toBe(false);
  });

  it("counts a custom hero slide even without a real settings.heroImage", () => {
    const result = computeStoreScore({
      settings: makeSettings(),
      products: [],
      categories: noCategories,
      heroSlides: [
        { id: "h1", mediaType: "image", mediaUrl: "https://cdn.example.com/slide.png", positionX: 50, positionY: 50, order: 0, active: true },
      ],
    });
    expect(result.criteria.find((c) => c.id === "hero")?.done).toBe(true);
  });

  it("only counts active products, and only real (non-placeholder) photos", () => {
    const result = computeStoreScore({
      settings: makeSettings(),
      products: [
        makeProduct({ active: false, images: ["https://cdn.example.com/inactive.png"] }),
        makeProduct({ id: "p2", active: true, images: ["placeholder:general:1"] }),
      ],
      categories: noCategories,
      heroSlides: noHeroSlides,
    });
    expect(result.criteria.find((c) => c.id === "products")?.done).toBe(true);
    expect(result.criteria.find((c) => c.id === "photos")?.done).toBe(false);
  });
});
