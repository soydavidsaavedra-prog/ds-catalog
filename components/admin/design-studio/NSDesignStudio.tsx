"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, HeroSlide, Product, SiteSettings, Testimonial } from "@/lib/types/catalog";
import type { ThemeKey } from "@/lib/types/tenant";
import { Home as Theme01Home } from "@/components/storefront/themes/theme-01/Home";
import { Home as Theme02Home } from "@/components/storefront/themes/theme-02/Home";
import { StudioSelectionProvider } from "@/lib/design-studio/selection-context";
import { NSTenantPreviewFrame } from "@/components/admin/design-studio/NSTenantPreviewFrame";
import { NSDesignStudioPanel } from "@/components/admin/design-studio/NSDesignStudioPanel";
import type { HeroDraft } from "@/components/admin/design-studio/NSHeroFieldsEditor";
import type { StatementDraft } from "@/components/admin/design-studio/NSStatementFieldsEditor";
import type { StoryDraft } from "@/components/admin/design-studio/NSStoryFieldsEditor";
import { DEFAULT_STEP_LABELS } from "@/components/storefront/themes/theme-01/NSFactoryStory";
import { cn } from "@/lib/utils/cn";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1440,
  tablet: 834,
  mobile: 390,
};

const DEVICE_OPTIONS: { value: Device; label: string }[] = [
  { value: "desktop", label: "Escritorio" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Móvil" },
];

export function NSDesignStudio({
  tenantId,
  tenantSlug,
  settings,
  categories,
  products,
  heroSlides,
  testimonials,
  savedTheme,
  allowedThemes,
}: {
  tenantId: string;
  tenantSlug: string;
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  heroSlides: HeroSlide[];
  testimonials: Testimonial[];
  savedTheme: ThemeKey;
  allowedThemes: ThemeKey[] | null;
}) {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(savedTheme);
  const [device, setDevice] = useState<Device>("desktop");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [heroDraft, setHeroDraft] = useState<HeroDraft>({
    eyebrow: settings.heroEyebrow,
    titleLine1: settings.heroTitleLine1,
    titleLine2: settings.heroTitleLine2,
    subtitle: settings.heroSubtitle,
    tagline: settings.heroTagline,
    ctaLabel: settings.heroCtaLabel,
    ctaHref: settings.heroCtaHref,
    image: settings.heroImage,
    imagePositionX: settings.heroImagePositionX,
    imagePositionY: settings.heroImagePositionY,
  });

  const [storyDraft, setStoryDraft] = useState<StoryDraft>({
    eyebrow: settings.storyEyebrow,
    title: settings.storyTitle,
    description: settings.storyDescription,
    stepImages: [
      settings.storyStepImage1,
      settings.storyStepImage2,
      settings.storyStepImage3,
      settings.storyStepImage4,
      settings.storyStepImage5,
    ],
    stepLabels: [
      settings.storyStepLabel1 ?? DEFAULT_STEP_LABELS[0],
      settings.storyStepLabel2 ?? DEFAULT_STEP_LABELS[1],
      settings.storyStepLabel3 ?? DEFAULT_STEP_LABELS[2],
      settings.storyStepLabel4 ?? DEFAULT_STEP_LABELS[3],
      settings.storyStepLabel5 ?? DEFAULT_STEP_LABELS[4],
    ],
  });

  const [statementDraft, setStatementDraft] = useState<StatementDraft>({
    titleLine1: settings.statementTitleLine1,
    titleLine2: settings.statementTitleLine2,
    description: settings.statementDescription,
    image: settings.statementImage,
  });

  // Switching the previewed theme can make the current selection point at
  // a section that theme doesn't render (e.g. "story" while previewing
  // theme-02, which has no factory-story section) — clear it rather than
  // leave the panel showing an editor for something no longer on screen.
  useEffect(() => {
    setSelectedId(null);
  }, [activeTheme]);

  const mergedSettings: SiteSettings = {
    ...settings,
    heroEyebrow: heroDraft.eyebrow,
    heroTitleLine1: heroDraft.titleLine1,
    heroTitleLine2: heroDraft.titleLine2,
    heroSubtitle: heroDraft.subtitle,
    heroTagline: heroDraft.tagline,
    heroCtaLabel: heroDraft.ctaLabel,
    heroCtaHref: heroDraft.ctaHref,
    heroImage: heroDraft.image,
    heroImagePositionX: heroDraft.imagePositionX,
    heroImagePositionY: heroDraft.imagePositionY,
    storyEyebrow: storyDraft.eyebrow,
    storyTitle: storyDraft.title,
    storyDescription: storyDraft.description,
    storyStepImage1: storyDraft.stepImages[0],
    storyStepImage2: storyDraft.stepImages[1],
    storyStepImage3: storyDraft.stepImages[2],
    storyStepImage4: storyDraft.stepImages[3],
    storyStepImage5: storyDraft.stepImages[4],
    storyStepLabel1: storyDraft.stepLabels[0],
    storyStepLabel2: storyDraft.stepLabels[1],
    storyStepLabel3: storyDraft.stepLabels[2],
    storyStepLabel4: storyDraft.stepLabels[3],
    storyStepLabel5: storyDraft.stepLabels[4],
    statementTitleLine1: statementDraft.titleLine1,
    statementTitleLine2: statementDraft.titleLine2,
    statementDescription: statementDraft.description,
    statementImage: statementDraft.image,
  };

  const ResolvedHome = activeTheme === "theme-02" ? Theme02Home : Theme01Home;

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface-elevated px-4 py-3">
        <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
          {DEVICE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDevice(option.value)}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                device === option.value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Link
          href={`/${tenantSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline"
        >
          Ver tienda real →
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        <div className="flex-1 overflow-y-auto rounded-card border border-border bg-surface p-4 sm:p-6">
          <StudioSelectionProvider
            value={{ selectedId, hoveredId, select: setSelectedId, setHovered: setHoveredId }}
          >
            <NSTenantPreviewFrame theme={activeTheme} settings={mergedSettings} mode="canvas" deviceWidth={DEVICE_WIDTHS[device]}>
              <ResolvedHome
                tenantSlug={tenantSlug}
                settings={mergedSettings}
                categories={categories}
                products={products}
                heroSlides={heroSlides}
                testimonials={testimonials}
              />
            </NSTenantPreviewFrame>
          </StudioSelectionProvider>
        </div>

        <div className="lg:w-[380px] lg:shrink-0">
          <NSDesignStudioPanel
            tenantId={tenantId}
            tenantSlug={tenantSlug}
            selectedId={selectedId}
            heroDraft={heroDraft}
            setHeroDraft={setHeroDraft}
            storyDraft={storyDraft}
            setStoryDraft={setStoryDraft}
            statementDraft={statementDraft}
            setStatementDraft={setStatementDraft}
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
            savedTheme={savedTheme}
            allowedThemes={allowedThemes}
          />
        </div>
      </div>
    </div>
  );
}
