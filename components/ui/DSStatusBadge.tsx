import { cn } from "@/lib/utils/cn";

type Tone = "success" | "warning" | "danger" | "muted" | "accent";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  muted: "bg-muted/10 text-muted-foreground border-border-strong",
  accent: "bg-accent/10 text-accent-strong border-accent/30",
};

/**
 * An outlined status pill — tenant status, subscription status, plan
 * active/inactive, product availability, all want the exact same
 * bordered "bg/10 + text + border/30" treatment. Was hand-copied per
 * page (see NSTenantStatusBadge, the plans page's active/inactive pill,
 * the subscriptions table's status cell) before this consolidated it.
 */
export function DSStatusBadge({ label, tone = "muted" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  );
}
