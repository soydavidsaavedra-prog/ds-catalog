"use client";

import { useState, useTransition } from "react";
import { syncAccountMetricsAction } from "@/app/[tenant]/admin/(shell)/redes-sociales/actions";
import { NSButton } from "@/components/ui/NSButton";

export function NSSyncMetricsButton({ tenantId, tenantSlug, accountId }: { tenantId: string; tenantSlug: string; accountId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <NSButton
        type="button"
        variant="outline"
        size="sm"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await syncAccountMetricsAction(tenantId, tenantSlug, accountId);
            if (result.error) setError(result.error);
          })
        }
      >
        Sincronizar ahora
      </NSButton>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
