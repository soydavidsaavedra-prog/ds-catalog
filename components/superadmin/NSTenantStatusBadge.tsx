import type { TenantStatus } from "@/lib/types/tenant";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<TenantStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  suspended: "Suspendido",
  archived: "Archivado",
};

const TONE: Record<TenantStatus, string> = {
  active: "bg-success/10 text-success border-success/30",
  paused: "bg-warning/10 text-warning border-warning/30",
  suspended: "bg-danger/10 text-danger border-danger/30",
  archived: "bg-muted/10 text-muted-foreground border-border-strong",
};

export function NSTenantStatusBadge({ status }: { status: TenantStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        TONE[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
