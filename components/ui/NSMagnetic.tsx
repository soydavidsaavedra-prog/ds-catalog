"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

interface NSMagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Max pull distance in px — kept small so it reads as a subtle magnetic pull, not a slingshot. */
  strength?: number;
  /** Set when wrapping a `w-full` button (e.g. a form submit) so the wrapper itself stretches instead of shrink-wrapping to content. */
  fullWidth?: boolean;
}

/**
 * Wraps a single interactive child (a button/link) and pulls it a few
 * pixels toward the cursor on hover — a lighter, business-appropriate take
 * on the "magnetic button" effect from the Uplink reference this was
 * modeled after. Desktop-only (gated on `(hover: hover) and (pointer:
 * fine)`, so touch taps are never affected) and fully inert when reduced
 * motion is requested — checked directly via `useReducedMotion` since this
 * is a manually-driven effect, not one triggered through `animate`/
 * `whileInView`, so it isn't covered by the root `MotionConfig` alone.
 *
 * Used only on the landing and /acceder — never wraps `NSButton` itself,
 * so nothing here can leak into the admin/superadmin dashboards.
 */
export function NSMagnetic({ children, className, strength = 18, fullWidth = false }: NSMagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  function handleMouseMove(event: React.MouseEvent<HTMLSpanElement>) {
    if (prefersReducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = event.clientX - rect.left - rect.width / 2;
    const relY = event.clientY - rect.top - rect.height / 2;
    x.set((relX / (rect.width / 2)) * strength);
    y.set((relY / (rect.height / 2)) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, display: "inline-block", width: fullWidth ? "100%" : undefined }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
