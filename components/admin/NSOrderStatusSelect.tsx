"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@/lib/types/order";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

export function NSOrderStatusSelect({
  status,
  onChangeStatus,
}: {
  status: OrderStatus;
  onChangeStatus: (status: OrderStatus) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => onChangeStatus(e.target.value as OrderStatus))}
      className="rounded-control border border-border-strong bg-surface-elevated px-2 py-1.5 text-xs font-medium disabled:opacity-60"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
