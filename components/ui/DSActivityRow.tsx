import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "default" | "warning" | "danger" | "success";

const toneClasses: Record<Tone, string> = {
  default: "border-border bg-surface hover:border-border-strong",
  warning: "border-warning/30 bg-warning/10 hover:border-warning/50",
  danger: "border-danger/30 bg-danger/10 hover:border-danger/50",
  success: "border-success/30 bg-success/10 hover:border-success/50",
};

const toneIconClasses: Record<Tone, string> = {
  default: "bg-accent/10 text-accent-strong",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  success: "bg-success/15 text-success",
};

/**
 * One line of a list of things that happened or need attention — an
 * order, a pending approval, a tenant close to its plan limit. Used
 * across both dashboards (and their "needs attention" panels) instead of
 * each section hand-rolling its own `<Link className="flex items-center
 * justify-between...">` row, which is exactly what the Super Admin
 * dashboard had four near-identical copies of before this.
 */
export function DSActivityRow({
  icon,
  title,
  meta,
  href,
  tone = "default",
}: {
  icon?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  href?: string;
  tone?: Tone;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-control border px-3.5 py-2.5 text-sm transition-colors",
        toneClasses[tone],
      )}
    >
      {icon ? (
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-control", toneIconClasses[tone])}>
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</span>
      {meta ? <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">{meta}</span> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
