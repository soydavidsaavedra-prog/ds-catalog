"use client";

import { motion } from "motion/react";
import { NSButton } from "@/components/ui/NSButton";
import { NSPlaceholderArt } from "@/components/ui/NSPlaceholderArt";

/**
 * Hero — the brand's first impression. Built with layered CSS/SVG art +
 * motion today; the composition (full-bleed media layer behind, content
 * layer above, slide index bottom-left) is deliberately shaped so a real
 * R3F/Three.js scene can later replace <NSPlaceholderArt> as the media
 * layer without touching layout or copy.
 */
export function NSHero() {
  return (
    <section className="relative flex h-[92vh] min-h-[640px] w-full items-end overflow-hidden bg-ink-950 text-ink-0 sm:h-screen">
      <div className="absolute inset-0">
        <NSPlaceholderArt category="hero" seed="hero-1" label="El Nuevo Sánchez" className="h-full w-full" />
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
          Calidad · Diseño · Confort
        </motion.p>

        <h1 className="font-display uppercase leading-[0.85] tracking-tight">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0, 0, 1] }}
            className="block text-[15vw] sm:text-7xl lg:text-8xl"
          >
            El Nuevo
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.2, 0, 0, 1] }}
            className="block text-[15vw] text-accent sm:text-7xl lg:text-8xl"
          >
            Sánchez
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-3 font-display text-lg uppercase tracking-[0.2em] text-ink-100 sm:text-2xl"
        >
          Especialista en Jeans
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center"
        >
          <NSButton href="/catalogo" size="lg" icon={<ArrowIcon />}>
            Explorar colección
          </NSButton>
          <p className="text-sm font-medium uppercase tracking-widest text-ink-300">
            De la fábrica a tus manos
          </p>
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
