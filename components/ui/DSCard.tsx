import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The bordered, rounded, padded surface every admin form section already
 * used — hand-repeated as `rounded-card border border-border
 * bg-surface-elevated p-6` in a dozen places (settings, product form,
 * hero editor, categories). A section title/description/actions header
 * is optional so this also works as a plain content box.
 */
export function DSCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-card border border-border bg-surface-elevated p-6", className)}>
      {title || actions ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="font-display text-lg uppercase tracking-wide">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
