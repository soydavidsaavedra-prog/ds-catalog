"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * A small dot + a lagging ring that replace the system cursor — the same
 * device used by the Uplink reference this whole pass is modeled after.
 * Desktop-with-a-mouse only: gated on `(hover: hover) and (pointer:
 * fine)`, checked once on mount, so touch devices never lose their real
 * cursor. Fully skipped under reduced motion, same reasoning as
 * `NSMagnetic` — a moving custom cursor is exactly the kind of motion that
 * setting exists to opt out of.
 *
 * Only ever mounted on the landing (`app/page.tsx`) and login
 * (`app/acceder/page.tsx`) pages — never in a shared layout — so it can
 * never reach a dashboard. It toggles a `.ds-cursor-none` class on
 * `<body>` for its own lifetime only (cleaned up on unmount, e.g. when
 * navigating away), which is what actually hides the system cursor; see
 * that class in app/globals.css, including its `input`/`textarea`
 * exception so typing into /acceder's form still shows a normal text
 * cursor.
 */
export function NSCustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 24 });
  const ringY = useSpring(y, { stiffness: 260, damping: 24 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    setEnabled(true);
    document.body.classList.add("ds-cursor-none");

    function handleMove(event: MouseEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as HTMLElement | null;
      setHot(!!target?.closest("a, button, input, textarea, [data-cursor-hot]"));
    }

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.body.classList.remove("ds-cursor-none");
    };
  }, [prefersReducedMotion, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] h-2 w-2 rounded-full bg-accent"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] rounded-full border border-accent/50"
        animate={{
          width: hot ? 46 : 30,
          height: hot ? 46 : 30,
          backgroundColor: hot ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        aria-hidden
      />
    </>
  );
}
