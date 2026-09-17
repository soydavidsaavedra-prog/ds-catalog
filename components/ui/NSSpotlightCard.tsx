"use client";

import { cn } from "@/lib/utils/cn";

interface NSSpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a bordered card with a soft radial highlight that follows the
 * cursor on hover — the `.swatch`/`.idea` hover treatment from the Uplink
 * reference. The highlight itself is pure CSS (`.ds-spotlight` in
 * app/globals.css); this component's only job is writing the pointer
 * position into `--spotlight-x`/`--spotlight-y` as CSS custom properties,
 * so there's no per-frame React re-render on mouse move. Landing/login
 * only, same as the rest of this pass.
 */
export function NSSpotlightCard({ children, className }: NSSpotlightCardProps) {
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div onMouseMove={handleMouseMove} className={cn("ds-spotlight", className)}>
      {children}
    </div>
  );
}
