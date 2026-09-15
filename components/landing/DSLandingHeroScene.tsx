"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Decorative background layer for the root landing's hero (app/page.tsx) —
 * NOT used by any tenant storefront. Reads as "a catalog assembling itself"
 * behind the headline: a few UI chips (product, price, category, WhatsApp
 * order, published) fade/slide into place around a faint browser-window
 * frame, each looping on its own offset so the scene never looks static or
 * perfectly synchronized — closer to organic activity than a slideshow.
 *
 * Colors are hardcoded to `.ds-landing-dark`'s own accent (#00a19a), not the
 * CSS var — this scene only ever renders inside that one fixed-dark scope
 * (see app/globals.css), never inside `.ds-platform` (admin chrome, a
 * different teal) or a tenant's own accent override.
 *
 * Purely decorative: `pointer-events-none` throughout, and every animated
 * value here is opacity/transform only (GPU-friendly, no layout thrashing).
 * `motion.*` animations already respect the OS "reduce motion" setting via
 * the root `<MotionConfig reducedMotion="user">` in app/layout.tsx — no
 * extra code needed here for that.
 */
export function DSLandingHeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end start"] });
  // As the hero scrolls past the top of the viewport, the scene drifts down
  // slightly slower than the page (a cheap parallax) and fades — a visual
  // handoff into the Features section right below, instead of an abrupt cut.
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div ref={sceneRef} style={{ y, opacity }} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Ambient glows — slow independent drift, pure opacity/transform. */}
      <motion.div
        className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 24, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Faint browser-window frame the chips read as "building into". */}
      <div className="absolute left-1/2 top-1/2 hidden h-[300px] w-[640px] max-w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-accent/15 bg-accent/[0.03] lg:block">
        <div className="flex items-center gap-1.5 border-b border-accent/10 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-accent/30" />
          <span className="h-2 w-2 rounded-full bg-accent/20" />
          <span className="h-2 w-2 rounded-full bg-accent/15" />
        </div>
      </div>

      {/* Assembling UI chips — desktop/tablet only, staggered independent loops. */}
      <SceneChip className="left-[6%] top-[14%]" delay={0}>
        <TagIcon /> Categoría
      </SceneChip>
      <SceneChip className="right-[8%] top-[20%]" delay={0.9}>
        <PriceIcon /> $24.900
      </SceneChip>
      <SceneChip className="right-[5%] bottom-[24%]" delay={1.8}>
        <WhatsAppIcon /> Pedido
      </SceneChip>
      <SceneChip className="left-[10%] bottom-[18%]" delay={2.7}>
        <ProductIcon /> Producto
      </SceneChip>
      <SceneChip className="left-[42%] top-[8%]" delay={3.6}>
        <CheckIcon /> Publicado
      </SceneChip>
    </motion.div>
  );
}

function SceneChip({ children, className, delay }: { children: React.ReactNode; className: string; delay: number }) {
  return (
    <motion.div
      className={`absolute hidden items-center gap-1.5 whitespace-nowrap rounded-control border border-accent/25 bg-ink-900/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent lg:flex ${className}`}
      animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -6], scale: [0.92, 1, 1, 0.96] }}
      transition={{ duration: 3.2, times: [0, 0.2, 0.8, 1], delay, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H4a1 1 0 0 0-1 1v5l8 8 6-6-8-8Z" />
      <circle cx="6.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="7.5" />
      <path strokeLinecap="round" d="M10 6v8M12 8.2c0-1-1-1.5-2-1.5s-2 .5-2 1.5.9 1.3 2 1.5c1.1.2 2 .6 2 1.6S11 13 10 13s-2-.5-2-1.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden>
      <path d="M10 2.5a7.5 7.5 0 0 0-6.47 11.28L2.5 17.5l3.83-1.01A7.5 7.5 0 1 0 10 2.5Zm0 1.5a6 6 0 1 1-3.16 11.1l-.23-.14-2.26.6.61-2.2-.15-.24A6 6 0 0 1 10 4Zm-2.1 2.75c-.15 0-.4.06-.6.3-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.12.16 1.6 2.45 3.9 3.34 1.9.74 2.3.6 2.7.56.4-.04 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.06-.1-.21-.16-.44-.27-.23-.12-1.35-.67-1.56-.74-.21-.08-.36-.12-.51.12-.15.24-.58.74-.71.89-.13.15-.26.17-.49.06-.23-.12-.96-.35-1.83-1.13-.68-.6-1.13-1.35-1.27-1.58-.13-.23-.01-.35.1-.47.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.5-1.26-.7-1.72-.18-.44-.37-.38-.5-.39Z" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 13 3.5-4 3 3L14 8l2 3" />
      <circle cx="7" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="10" cy="10" r="7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6.5 10 2.3 2.3L13.5 7.5" />
    </svg>
  );
}
