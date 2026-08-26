import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The title/description/actions row at the top of every admin and Super
 * Admin page — same three-part hierarchy (Página / Descripción /
 * Acciones) everywhere instead of each page hand-rolling its own
 * `<h1>`+`<p>` block with slightly different spacing and casing.
 */
export function DSPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-strong">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-3xl uppercase leading-none tracking-wide text-foreground">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
