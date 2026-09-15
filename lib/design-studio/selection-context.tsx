"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StudioSelectionValue {
  selectedId: string | null;
  hoveredId: string | null;
  select: (id: string) => void;
  setHovered: (id: string | null) => void;
}

const StudioSelectionContext = createContext<StudioSelectionValue | null>(null);

export function StudioSelectionProvider({
  value,
  children,
}: {
  value: StudioSelectionValue;
  children: ReactNode;
}) {
  return <StudioSelectionContext.Provider value={value}>{children}</StudioSelectionContext.Provider>;
}

/**
 * Wraps one selectable region of a Theme's Home for the Design Studio's
 * click-to-select. Outside the Studio (the real public storefront, which
 * never renders a StudioSelectionProvider) this is a pure passthrough —
 * `<>{children}</>`, zero visual or behavioral change — so wrapping
 * production sections in Home.tsx carries no risk for real visitors.
 */
export function NSStudioSelectable({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(StudioSelectionContext);
  if (!ctx) return <>{children}</>;

  const isSelected = ctx.selectedId === id;
  const isHovered = ctx.hoveredId === id;

  return (
    <div
      className={cn("relative", className)}
      onClick={(e) => {
        e.stopPropagation();
        ctx.select(id);
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        ctx.setHovered(id);
      }}
      onMouseLeave={() => ctx.setHovered(null)}
    >
      {children}
      {isSelected || isHovered ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-40 ring-2 ring-inset",
            isSelected ? "ring-accent" : "ring-accent/40",
          )}
          aria-hidden
        />
      ) : null}
      {isSelected || isHovered ? (
        <span
          className="pointer-events-none absolute left-1.5 top-1.5 z-40 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground"
          aria-hidden
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
