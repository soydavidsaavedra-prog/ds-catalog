"use client";

import { useMemo, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types/order";
import { formatPrice } from "@/lib/utils/format";
import { NSInput, NSSelect } from "@/components/ui/NSInput";
import { DSTable } from "@/components/ui/DSTable";
import { NSOrderStatusSelect } from "@/components/admin/NSOrderStatusSelect";

const STATUS_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "new", label: "Nuevo" },
  { key: "contacted", label: "Contactado" },
  { key: "confirmed", label: "Confirmado" },
  { key: "completed", label: "Completado" },
  { key: "cancelled", label: "Cancelado" },
];

export function NSOrdersTable({
  orders,
  onChangeOrderStatus,
}: {
  orders: Order[];
  onChangeOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesQuery = !q || (o.customerName ?? "").toLowerCase().includes(q) || (o.customerPhone ?? "").includes(q);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <NSInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente o teléfono…"
          className="sm:max-w-xs"
        />
        <NSSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="sm:max-w-xs"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </NSSelect>
        <p className="text-xs text-muted-foreground sm:ml-auto">
          {filtered.length} de {orders.length} pedidos
        </p>
      </div>

      <DSTable
        isEmpty={filtered.length === 0}
        emptyMessage="Sin resultados."
        columns={[
          { label: "Fecha" },
          { label: "Cliente" },
          { label: "Artículos" },
          { label: "Total" },
          { label: "Estado" },
        ]}
      >
        {filtered.map((order) => (
          <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleString("es-VE")}</td>
            <td className="px-4 py-3">{order.customerName ?? "—"}</td>
            <td className="px-4 py-3">{order.items.length}</td>
            <td className="px-4 py-3 tabular-nums">{formatPrice(order.total)}</td>
            <td className="px-4 py-3">
              <NSOrderStatusSelect status={order.status} onChangeStatus={(status) => onChangeOrderStatus(order.id, status)} />
            </td>
          </tr>
        ))}
      </DSTable>
    </div>
  );
}
