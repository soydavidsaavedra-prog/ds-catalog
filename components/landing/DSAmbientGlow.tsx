"use client";

import { motion } from "motion/react";

/**
 * Two slow-drifting blurred glow blobs, reading the ambient scope's own
 * --accent token via color-mix() (same idiom already used by
 * app/acceder/page.tsx's brand-panel overlay) instead of a hardcoded hex —
 * so the same component looks right inside `.ds-landing-dark` (teal
 * #00a19a) or `.ds-platform` (teal #14b8ae). Purely decorative
 * (`pointer-events-none`, `aria-hidden`); respects "reduce motion" through
 * the root `MotionConfig reducedMotion="user"` in app/layout.tsx like
 * every other `motion.*` animation in the app — no extra code needed here.
 *
 * Distinct from `DSLandingHeroScene` (which also has two glow blobs, but
 * hardcodes the landing's exact teal since it only ever renders in that
 * one scope) — this one exists so a second surface, like /acceder's brand
 * panel, can get the same ambient life without duplicating the scene's
 * chip/parallax machinery it doesn't need.
 */
export function DSAmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 bottom-0 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 20%, transparent), transparent 70%)" }}
        animate={{ x: [0, -24, 0], y: [0, 24, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
    </div>
  );
}
