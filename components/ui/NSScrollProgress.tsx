"use client";

import { motion, useScroll } from "motion/react";

/**
 * A thin fixed bar at the very top of the viewport whose width tracks
 * scroll progress down the page — the reading-progress bar from the
 * Uplink reference. Purely decorative (`aria-hidden`); `useScroll` here
 * tracks the whole document by default (no `target` ref), which is what
 * we want for a page-wide indicator. Respects reduced motion through the
 * root `MotionConfig` like every other `motion.*` piece in this pass.
 */
export function NSScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-accent to-accent-strong"
      style={{ scaleX: scrollYProgress }}
      aria-hidden
    />
  );
}
