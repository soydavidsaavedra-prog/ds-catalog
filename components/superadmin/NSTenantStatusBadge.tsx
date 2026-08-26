import type { TenantStatus } from "@/lib/types/tenant";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";

const LABELS: Record<TenantStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  suspended: "Suspendido",
  archived: "Archivado",
};

const TONE: Record<TenantStatus, "success" | "warning" | "danger" | "muted"> = {
  active: "success",
  paused: "warning",
  suspended: "danger",
  archived: "muted",
};

export function NSTenantStatusBadge({ status }: { status: TenantStatus }) {
  return <DSStatusBadge label={LABELS[status]} tone={TONE[status]} />;
}
