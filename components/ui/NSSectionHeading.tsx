import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function NSSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "inverted";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        action ? "sm:flex-row sm:items-end sm:justify-between sm:text-left" : undefined,
        className,
      )}
    >
      <div className={cn("flex flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow ? (
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.28em]",
              tone === "inverted" ? "text-accent" : "text-accent-strong",
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        <h2
          className={cn(
            "font-display text-3xl uppercase leading-none tracking-wide sm:text-4xl",
            tone === "inverted" ? "text-ink-0" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "max-w-xl text-sm leading-relaxed",
              tone === "inverted" ? "text-ink-200" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
