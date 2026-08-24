"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

/**
 * Shared scroll-reveal primitive — the one entrance animation used across
 * the home page, so motion reads as one consistent language instead of a
 * different effect per section.
 */
export function NSReveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
