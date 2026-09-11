"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Availability, Product } from "@/lib/types/catalog";
import { formatPrice, availabilityLabel } from "@/lib/utils/format";
import { NSInput, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSMedia } from "@/components/ui/NSMedia";
import { DSTable } from "@/components/ui/DSTable";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { cn } from "@/lib/utils/cn";
import {
  deleteProductAction,
  deleteProductsAction,
  setProductsActiveAction,
  toggleProductFlagAction,
} from "@/app/[tenant]/admin/actions";

const AVAILABILITY_TONE: Record<Availability, "success" | "warning" | "danger"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
};

type SortKey = "name" | "price";

type StatusFilter = "all" | "active" | "inactive";

export function NSProductsTable({
  tenantId,
  tenantSlug,
  products,
  categoryOptions,
  initialStatusFilter = "all",
}: {
  tenantId: string;
  tenantSlug: string;
  products: Product[];
  /** [slug, name][] — only categories that actually have products, in display order. */
  categoryOptions: [string, string][];
  /** Preset from ?estado= in the URL — e.g. the "Ver borradores" link after a batch create lands here already filtered to inactive. */
  initialStatusFilter?: StatusFilter;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter);
  const [sortKey, setSortKey] = useState<SortKey | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const categoryName = new Map(categoryOptions);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || p.categorySlug === categoryFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active") === p.active;
      return matchesQuery && matchesCategory && matchesStatus;
    });
    if (!sortKey) return result;
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...result].sort((a, b) => {
      if (sortKey === "price") return (a.price - b.price) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
  }, [products, query, categoryFilter, statusFilter, sortKey, sortDirection]);

  function handleSort(key: string) {
    if (key !== "name" && key !== "price") return;
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const visibleIds = filtered.map((p) => p.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.has(id));

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of visibleIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  const selectedList = Array.from(selectedIds);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <NSInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o referencia…"
          className="sm:max-w-xs"
        />
        <NSSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="sm:max-w-xs">
          <option value="all">Todas las categorías</option>
          {categoryOptions.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </NSSelect>
        <NSSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="sm:max-w-[9rem]">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </NSSelect>
        <p className="text-xs text-muted-foreground sm:ml-auto">
          {filtered.length} de {products.length} productos
        </p>
      </div>

      {selectedList.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-control border border-border bg-surface-elevated px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedList.length} seleccionado{selectedList.length === 1 ? "" : "s"}
          </span>
          <form action={setProductsActiveAction.bind(null, tenantId, tenantSlug, selectedList, true)} onSubmit={() => setSelectedIds(new Set())}>
            <NSButton type="submit" variant="outline" size="sm">
              Activar
            </NSButton>
          </form>
          <form action={setProductsActiveAction.bind(null, tenantId, tenantSlug, selectedList, false)} onSubmit={() => setSelectedIds(new Set())}>
            <NSButton type="submit" variant="outline" size="sm">
              Desactivar
            </NSButton>
          </form>
          <form
            action={deleteProductsAction.bind(null, tenantId, tenantSlug, selectedList)}
            onSubmit={(e) => {
              const message = `¿Eliminar ${selectedList.length} producto(s)? Esta acción no se puede deshacer.`;
              if (!window.confirm(message)) {
                e.preventDefault();
                return;
              }
              setSelectedIds(new Set());
            }}
          >
            <NSButton type="submit" variant="outline" size="sm" className="text-danger hover:bg-danger/10">
              Eliminar
            </NSButton>
          </form>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancelar selección
          </button>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            ref={(el) => {
              if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
            }}
            onChange={(e) => toggleAllVisible(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
          />
          Seleccionar los {filtered.length} productos visibles
        </label>
      ) : null}

      <DSTable
        minWidth={760}
        isEmpty={filtered.length === 0}
        emptyMessage="Sin resultados."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        columns={[
          { label: "" },
          { label: "Producto", sortKey: "name" },
          { label: "Categoría" },
          { label: "Precio", sortKey: "price" },
          { label: "Estado" },
          { label: "Activo" },
          { label: "" },
        ]}
      >
        {filtered.map((product) => (
          <tr key={product.id} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.has(product.id)}
                onChange={(e) => toggleOne(product.id, e.target.checked)}
                aria-label={`Seleccionar ${product.name}`}
                className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
              />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-10 shrink-0 overflow-hidden rounded-control">
                  <NSMedia src={product.images[0]} alt={product.name} reference={product.reference} sizes="40px" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.reference}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {categoryName.get(product.categorySlug) ?? product.categorySlug}
            </td>
            <td className="px-4 py-3 tabular-nums">{formatPrice(product.price)}</td>
            <td className="px-4 py-3">
              <DSStatusBadge label={availabilityLabel[product.availability]} tone={AVAILABILITY_TONE[product.availability]} />
            </td>
            <td className="px-4 py-3">
              <form action={toggleProductFlagAction.bind(null, tenantId, tenantSlug, product.id, "active", !product.active)}>
                <button
                  type="submit"
                  role="switch"
                  aria-checked={product.active}
                  title={product.active ? "Clic para desactivar" : "Clic para activar"}
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-pill transition-colors",
                      product.active ? "bg-success" : "bg-border-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                        product.active ? "translate-x-4" : "translate-x-0.5",
                      )}
                    />
                  </span>
                  <span className={cn("text-xs font-medium", product.active ? "text-success" : "text-muted-foreground")}>
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </button>
              </form>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-3">
                <Link
                  href={`/${tenantSlug}/admin/productos/${product.id}`}
                  className="text-xs font-semibold uppercase text-accent-strong hover:underline"
                >
                  Editar
                </Link>
                <NSAdminDeleteButton
                  action={deleteProductAction.bind(null, tenantId, tenantSlug, product.id)}
                  confirmMessage={`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`}
                />
              </div>
            </td>
          </tr>
        ))}
      </DSTable>
    </div>
  );
}
