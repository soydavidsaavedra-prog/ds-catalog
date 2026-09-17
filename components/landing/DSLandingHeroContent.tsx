"use client";

import { motion } from "motion/react";
import { NSButton } from "@/components/ui/NSButton";
import { NSMagnetic } from "@/components/ui/NSMagnetic";

/**
 * The landing hero's text block (eyebrow, headline, subcopy, CTAs) as a
 * mount cascade — each piece fades/rises in with its own delay, same
 * pattern already used by the storefront's own hero
 * (components/storefront/themes/theme-01/NSHero.tsx). This is an
 * entrance-on-load animation (`initial`/`animate`), not a scroll reveal
 * like `NSReveal`, since the hero is already above the fold on arrival.
 *
 * All copy here is static, so this needed no props — it's a client island
 * purely so `motion.*` and the mouse-driven `NSMagnetic` wrapper can run;
 * `app/page.tsx` stays an async Server Component around it.
 */
export function DSLandingHeroContent() {
  return (
    <>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex items-center gap-2 rounded-pill border border-accent/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent"
      >
        <span className="h-1.5 w-1.5 animate-blink-dot rounded-full bg-accent" aria-hidden />
        Catálogos para negocios
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0, 0, 1] }}
        className="ds-text-shine font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl"
      >
        Tu catálogo en línea, listo en minutos
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="max-w-xl text-base text-ink-300 sm:text-lg"
      >
        Crea tu catálogo, súbelo con tus propios productos y recibe pedidos directo por WhatsApp — sin
        complicaciones técnicas.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-2 flex flex-col gap-3 sm:flex-row"
      >
        <NSMagnetic>
          <NSButton href="/registro" size="lg">
            Crear mi catálogo
          </NSButton>
        </NSMagnetic>
        <NSButton href="/acceder" variant="outline" size="lg">
          Ya tengo cuenta
        </NSButton>
      </motion.div>
    </>
  );
}
