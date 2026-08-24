import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "gold" | "ink" | "denim" | "success" | "warning" | "danger" | "outline";

const toneClasses: Record<Tone, string> = {
  gold: "bg-accent text-accent-foreground",
  ink: "bg-ink-950 text-ink-0",
  denim: "bg-denim text-denim-foreground",
  success: "bg-success text-white",
  warning: "bg-warning text-ink-950",
  danger: "bg-danger text-white",
  outline: "border border-border-strong text-foreground bg-transparent",
};

export function NSBadge({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-control px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
