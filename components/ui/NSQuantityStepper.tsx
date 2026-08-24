"use client";

import { cn } from "@/lib/utils/cn";

export function NSQuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center rounded-control border border-border-strong", className)}>
      <button
        type="button"
        aria-label="Disminuir cantidad"
        className="flex h-11 w-11 items-center justify-center text-lg text-foreground transition-colors hover:bg-surface disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        &minus;
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        className="flex h-11 w-11 items-center justify-center text-lg text-foreground transition-colors hover:bg-surface disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
