"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { NSButton } from "@/components/ui/NSButton";
import { NSMedia } from "@/components/ui/NSMedia";
import type { HeroSlide } from "@/lib/types/catalog";

export interface NSHeroProps {
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  tagline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imagePositionX?: number;
  imagePositionY?: number;
  brandName?: string;
  /** Active hero slides, already ordered — see /admin/hero. Rotates the background automatically; empty/omitted falls back to the single `image` above exactly as before, so a tenant with no slides sees no change at all. */
  slides?: HeroSlide[];
}

const DEFAULTS: Required<Omit<NSHeroProps, "imagePositionX" | "imagePositionY" | "brandName" | "slides">> = {
  eyebrow: "Calidad · Diseño · Confort",
  titleLine1: "El Nuevo",
  titleLine2: "Sánchez",
  subtitle: "Especialista en Jeans",
  tagline: "De la fábrica a tus manos",
  ctaLabel: "Explorar colección",
  ctaHref: "/catalogo",
  image: "placeholder:hero:hero-1",
};

/** How long each hero slide stays up before advancing to the next — same for photos and videos, since a background video here is meant to be a short muted loop, not a clip to watch through. */
const SLIDE_DURATION_MS = 6000;

/**
 * Hero — the brand's first impression. Content is admin-editable (see
 * /admin/inicio, backed by SiteSettings.hero*), all props default to the
 * original launch copy so the section renders identically until an admin
 * customizes it.
 *
 * Mobile and sm+ are genuinely different layouts, not one layout squeezed
 * by breakpoints: on a phone, a fixed near-full-screen box forcing every
 * uploaded photo into the same crop/frame looked broken for anything that
 * wasn't already shaped like it. Below sm, the photo instead sits flush
 * under the header at its own natural aspect ratio (via NSMedia's `auto`
 * mode) — whatever shape it is — and the title/CTA/fade sit pinned to
 * that photo's own bottom edge, not the viewport's. From sm up there's
 * enough width for the original full-bleed, full-height treatment to look
 * right, so it's unchanged there.
 *
 * `slides` (see /admin/hero) only ever swaps out what's playing behind
 * this same text/CTA — title, subtitle, tagline and button stay put. Only
 * the background media rotates, on a plain fixed timer regardless of
 * media type (see SLIDE_DURATION_MS) — no video-end detection, so a short
 * video loops silently until the timer advances and a long one gets cut
 * off; that tradeoff keeps the rotation simple and predictable across
 * mixed photo/video slides instead of depending on each video's own
 * length.
 */
export function NSHero({
  eyebrow = DEFAULTS.eyebrow,
  titleLine1 = DEFAULTS.titleLine1,
  titleLine2 = DEFAULTS.titleLine2,
  subtitle = DEFAULTS.subtitle,
  tagline = DEFAULTS.tagline,
  ctaLabel = DEFAULTS.ctaLabel,
  ctaHref = DEFAULTS.ctaHref,
  image = DEFAULTS.image,
  imagePositionX = 50,
  imagePositionY = 50,
  brandName,
  slides = [],
}: NSHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setActiveIndex((i) => (i + 1) % slides.length), SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides.length > 0 ? slides[activeIndex % slides.length] : null;
  const mediaSrc = activeSlide?.mediaUrl ?? image;
  const mediaPositionX = activeSlide?.positionX ?? imagePositionX;
  const mediaPositionY = activeSlide?.positionY ?? imagePositionY;
  const mediaKey = activeSlide?.id ?? "static";

  return (
    <>
      <section className="relative w-full bg-ink-950 text-ink-0 sm:hidden">
        <div className="relative w-full">
          {activeSlide?.mediaType === "video" ? (
            <video
              key={mediaKey}
              src={mediaSrc}
              autoPlay
              muted
              loop
              playsInline
              className="block h-auto w-full"
            />
          ) : (
            <NSMedia key={mediaKey} src={mediaSrc} alt={`${titleLine1} ${titleLine2}`} priority auto brandName={brandName} />
          )}
          {/* Both the fade and the text are absolutely positioned inside this
              same wrapper, whose height is set purely by the image above (an
              ordinary in-flow element) — so "bottom-0" here always means the
              image's own bottom edge, whatever its aspect ratio turns out to
              be, never a guessed pixel offset. */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
            <h1 className="font-display text-4xl uppercase leading-[0.9] tracking-tight">
              <span className="block">{titleLine1}</span>
              <span className="block text-accent">{titleLine2}</span>
            </h1>
            <p className="mt-2 font-display text-base uppercase tracking-[0.2em] text-ink-100">{subtitle}</p>
            <div className="mt-6 flex flex-col gap-4">
              <NSButton href={ctaHref} size="md" icon={<ArrowIcon />} className="self-start">
                {ctaLabel}
              </NSButton>
              <p className="text-xs font-medium uppercase tracking-widest text-ink-300">{tagline}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden h-[92vh] min-h-[640px] w-full items-end overflow-hidden bg-ink-950 text-ink-0 sm:flex sm:h-screen">
        <div className="absolute inset-0">
          {activeSlide?.mediaType === "video" ? (
            <video
              key={mediaKey}
              src={mediaSrc}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
              style={{ objectPosition: `${mediaPositionX}% ${mediaPositionY}%` }}
            />
          ) : (
            <NSMedia
              key={mediaKey}
              src={mediaSrc}
              alt={`${titleLine1} ${titleLine2}`}
              priority
              className="h-full w-full"
              objectPosition={`${mediaPositionX}% ${mediaPositionY}%`}
              brandName={brandName}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-accent"
          >
            {eyebrow}
          </motion.p>

          <h1 className="font-display uppercase leading-[0.85] tracking-tight">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0, 0, 1] }}
              className="block text-7xl lg:text-8xl"
            >
              {titleLine1}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.2, 0, 0, 1] }}
              className="block text-7xl text-accent lg:text-8xl"
            >
              {titleLine2}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="mt-3 font-display text-2xl uppercase tracking-[0.2em] text-ink-100"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-row items-center gap-5"
          >
            <NSButton href={ctaHref} size="lg" icon={<ArrowIcon />}>
              {ctaLabel}
            </NSButton>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-300">{tagline}</p>
          </motion.div>
        </div>

        {slides.length > 1 ? (
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 lg:left-8">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir a la foto ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === activeIndex % slides.length ? "w-6 bg-accent" : "w-1.5 bg-ink-0/40 hover:bg-ink-0/70"}`}
              />
            ))}
          </div>
        ) : (
          <div className="absolute bottom-6 left-6 z-10 text-xs font-medium tracking-widest text-ink-400 lg:left-8">
            01 / 01
          </div>
        )}
      </section>
    </>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
