"use client";

import { motion } from "motion/react";
import { NSButton } from "@/components/ui/NSButton";
import { NSMedia } from "@/components/ui/NSMedia";

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
}

const DEFAULTS: Required<Omit<NSHeroProps, "imagePositionX" | "imagePositionY" | "brandName">> = {
  eyebrow: "Calidad · Diseño · Confort",
  titleLine1: "El Nuevo",
  titleLine2: "Sánchez",
  subtitle: "Especialista en Jeans",
  tagline: "De la fábrica a tus manos",
  ctaLabel: "Explorar colección",
  ctaHref: "/catalogo",
  image: "placeholder:hero:hero-1",
};

/**
 * Hero — the brand's first impression. Content is admin-editable (see
 * /admin/inicio, backed by SiteSettings.hero*), all props default to the
 * original launch copy so the section renders identically until an admin
 * customizes it. Built with layered CSS/SVG art (or a real photo via
 * NSMedia) + motion; the composition (full-bleed media layer behind,
 * content layer above, slide index bottom-left) is deliberately shaped so a
 * real R3F/Three.js scene could later replace the media layer without
 * touching layout or copy.
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
}: NSHeroProps) {
  return (
    <section className="relative flex h-[92vh] min-h-[640px] w-full items-end overflow-hidden bg-ink-950 text-ink-0 sm:h-screen">
      <div className="absolute inset-0">
        <NSMedia
          src={image}
          alt={`${titleLine1} ${titleLine2}`}
          priority
          className="h-full w-full"
          objectPosition={`${imagePositionX}% ${imagePositionY}%`}
          objectFitMobile="contain"
          brandName={brandName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
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
            className="block text-[15vw] sm:text-7xl lg:text-8xl"
          >
            {titleLine1}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.2, 0, 0, 1] }}
            className="block text-[15vw] text-accent sm:text-7xl lg:text-8xl"
          >
            {titleLine2}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-3 font-display text-lg uppercase tracking-[0.2em] text-ink-100 sm:text-2xl"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center"
        >
          <NSButton href={ctaHref} size="lg" icon={<ArrowIcon />}>
            {ctaLabel}
          </NSButton>
          <p className="text-sm font-medium uppercase tracking-widest text-ink-300">{tagline}</p>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-4 z-10 hidden text-xs font-medium tracking-widest text-ink-400 sm:left-6 sm:block lg:left-8">
        01 / 01
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
