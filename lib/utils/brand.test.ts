import { describe, expect, it } from "vitest";
import { brandInitials, buildAccentOverrideVars, readableForegroundFor } from "@/lib/utils/brand";
import type { SiteSettings } from "@/lib/types/catalog";

function makeSettings(overrides: Partial<SiteSettings> = {}): SiteSettings {
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
    ...overrides,
  };
}

describe("buildAccentOverrideVars", () => {
  it("returns CSS vars when all three colors are set and valid hex", () => {
    const vars = buildAccentOverrideVars({
      ...makeSettings(),
      accentColor: "#c9a227",
      accentColorStrong: "#a5821c",
      accentForeground: "#0a0a09",
    });
    expect(vars).toEqual({
      "--accent": "#c9a227",
      "--accent-strong": "#a5821c",
      "--accent-foreground": "#0a0a09",
      "--focus-ring": "#a5821c",
    });
  });

  it("returns undefined when any of the three is missing", () => {
    expect(
      buildAccentOverrideVars({ ...makeSettings(), accentColor: "#c9a227", accentColorStrong: null, accentForeground: "#000000" }),
    ).toBeUndefined();
    expect(buildAccentOverrideVars(makeSettings())).toBeUndefined();
  });

  it("returns undefined when a value isn't strict 6-digit hex (rejects CSS injection attempts)", () => {
    expect(
      buildAccentOverrideVars({
        ...makeSettings(),
        accentColor: "red",
        accentColorStrong: "#a5821c",
        accentForeground: "#0a0a09",
      }),
    ).toBeUndefined();
    expect(
      buildAccentOverrideVars({
        ...makeSettings(),
        accentColor: "#fff",
        accentColorStrong: "#a5821c",
        accentForeground: "#0a0a09",
      }),
    ).toBeUndefined();
    expect(
      buildAccentOverrideVars({
        ...makeSettings(),
        accentColor: "#123abc; } body { display: none",
        accentColorStrong: "#a5821c",
        accentForeground: "#0a0a09",
      }),
    ).toBeUndefined();
  });
});

describe("readableForegroundFor", () => {
  it("picks black text on a light background", () => {
    expect(readableForegroundFor("#ffffff")).toBe("#0a0a09");
    expect(readableForegroundFor("#f5d020")).toBe("#0a0a09");
  });

  it("picks white text on a dark background", () => {
    expect(readableForegroundFor("#000000")).toBe("#ffffff");
    expect(readableForegroundFor("#111111")).toBe("#ffffff");
  });

  it("falls back to near-black for a malformed hex", () => {
    expect(readableForegroundFor("not-a-color")).toBe("#0a0a09");
    expect(readableForegroundFor("#fff")).toBe("#0a0a09");
  });
});

describe("brandInitials", () => {
  it("takes the first two letters of a single word", () => {
    expect(brandInitials("Acme")).toBe("AC");
  });

  it("takes the first letter of the last two words for multi-word names", () => {
    expect(brandInitials("El Nuevo Sánchez")).toBe("NS");
    expect(brandInitials("Demo Store")).toBe("DS");
  });

  it("returns an empty string for blank input", () => {
    expect(brandInitials("")).toBe("");
    expect(brandInitials("   ")).toBe("");
  });
});
