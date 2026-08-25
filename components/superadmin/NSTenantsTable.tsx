"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TenantSummary } from "@/lib/repositories/superadmin-repository";
import type { TenantStatus } from "@/lib/types/tenant";
import { NSInput } from "@/components/ui/NSInput";
import { NSTenantStatusBadge } from "@/components/superadmin/NSTenantStatusBadge";
import { cn } from "@/lib/utils/cn";

const STATUS_FILTERS: { key: TenantStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "paused", label: "Pausados" },
  { key: "suspended", label: "Suspendidos" },
  { key: "archived", label: "Archivados" },
];

export function NSTenantsTable({ tenants }: { tenants: TenantSummary[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tenants.filter((t) => {
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [tenants, query, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NSInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o slug…"
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                "rounded-pill border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                statusFilter === f.key
                  ? "border-accent-strong bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-border-strong",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Productos</th>
              <th className="px-4 py-3 font-semibold text-right">Pedidos</th>
              <th className="px-4 py-3 font-semibold">Creado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/superadmin/tenants/${t.id}`} className="font-medium hover:text-accent-strong">
                      {t.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">/{t.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <NSTenantStatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{t.counts.products}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{t.counts.orders}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString("es")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
