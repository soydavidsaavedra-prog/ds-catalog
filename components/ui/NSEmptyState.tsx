import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The one "nothing here yet" block for the whole app — catalog/category
 * empty, search with no matches, empty cart, empty favorites, dashboard
 * with no activity, etc. Every one of those used to be its own hand-rolled
 * JSX block with near-identical markup and slightly different wording;
 * this is the single place that owns the look, so a design tweak (spacing,
 * border, icon treatment) doesn't need to be repeated in five files.
 */
export function NSEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center text-muted-foreground/50" aria-hidden>
          {icon}
        </span>
      ) : null}
      <p className="font-display text-xl uppercase tracking-wide sm:text-2xl">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
