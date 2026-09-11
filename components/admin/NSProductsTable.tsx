"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import type { Availability, Product } from "@/lib/types/catalog";
import { availabilityLabel } from "@/lib/utils/format";
import { siteConfig } from "@/lib/config/site";
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
  duplicateProductAction,
  setProductsActiveAction,
  toggleProductFlagAction,
  updateProductQuickFieldsAction,
  updateProductStockAction,
} from "@/app/[tenant]/admin/actions";

const currencySymbol = siteConfig.commerce.currencySymbol;

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const categoryName = new Map(categoryOptions);

  // Inline shortcut for the fields tenants most often need to fix right
  // after a lote-fotos batch (provisional name/reference/price) without
  // opening the full edit page. Uncontrolled inputs: value only ever needs
  // to move from the DOM to the server, and back to the DOM on a rejected
  // (or invalid) save.
  async function saveQuickField(product: Product, field: "name" | "reference" | "price", input: HTMLInputElement) {
    const raw = input.value.trim();

    if (field === "price") {
      const parsedPrice = Number(raw);
      if (raw === "" || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
        input.value = String(product.price);
        return;
      }
      if (parsedPrice === product.price) return;

      const result = await updateProductQuickFieldsAction(tenantId, tenantSlug, product.id, {
        name: product.name,
        reference: product.reference,
        price: parsedPrice,
      });
      if (result.error) {
        input.value = String(product.price);
        setFieldErrors((prev) => ({ ...prev, [product.id]: result.error! }));
      } else {
        setFieldErrors((prev) => {
          if (!(product.id in prev)) return prev;
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }
      return;
    }

    const currentValue = field === "name" ? product.name : product.reference;
    if (raw === currentValue) return;

    const fields =
      field === "name"
        ? { name: raw, reference: product.reference, price: product.price }
        : { name: product.name, reference: raw, price: product.price };
    const result = await updateProductQuickFieldsAction(tenantId, tenantSlug, product.id, fields);

    if (result.error) {
      input.value = currentValue;
      setFieldErrors((prev) => ({ ...prev, [product.id]: result.error! }));
    } else {
      setFieldErrors((prev) => {
        if (!(product.id in prev)) return prev;
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  }

  // Also how a product starts tracking stock in the first place: typing a
  // number here for a product that had none (stock === null) turns
  // tracking on for it immediately, same as filling the Stock field on the
  // full edit form — no need to open that page just to set the first number.
  async function saveStock(product: Product, input: HTMLInputElement) {
    const raw = input.value.trim();
    const revertTo = product.stock === null ? "" : String(product.stock);
    const parsed = Number(raw);
    if (raw === "" || !Number.isFinite(parsed) || parsed < 0) {
      input.value = revertTo;
      return;
    }
    const nextStock = Math.floor(parsed);
    if (nextStock === product.stock) return;

    const result = await updateProductStockAction(tenantId, tenantSlug, product.id, nextStock);
    if (result.error) {
      input.value = revertTo;
      setFieldErrors((prev) => ({ ...prev, [product.id]: result.error! }));
    } else {
      setFieldErrors((prev) => {
        if (!(product.id in prev)) return prev;
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  }

  function handleQuickFieldKeyDown(e: KeyboardEvent<HTMLInputElement>, revertTo: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.currentTarget.value = revertTo;
      e.currentTarget.blur();
    }
  }

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
          { label: "Stock" },
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
                <div className="min-w-0 flex-1">
                  <input
                    defaultValue={product.name}
                    aria-label={`Nombre de ${product.name}`}
                    onBlur={(e) => saveQuickField(product, "name", e.currentTarget)}
                    onKeyDown={(e) => handleQuickFieldKeyDown(e, product.name)}
                    className="w-full truncate rounded border border-transparent bg-transparent px-1 py-0.5 -mx-1 text-sm font-medium hover:border-border focus:border-accent-strong focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/40"
                  />
                  <input
                    defaultValue={product.reference}
                    aria-label={`Referencia de ${product.name}`}
                    onBlur={(e) => saveQuickField(product, "reference", e.currentTarget)}
                    onKeyDown={(e) => handleQuickFieldKeyDown(e, product.reference)}
                    className="mt-0.5 w-full truncate rounded border border-transparent bg-transparent px-1 py-0.5 -mx-1 text-xs text-muted-foreground hover:border-border focus:border-accent-strong focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/40"
                  />
                  {fieldErrors[product.id] ? (
                    <p className="mt-0.5 text-[11px] text-danger">{fieldErrors[product.id]}</p>
                  ) : null}
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {categoryName.get(product.categorySlug) ?? product.categorySlug}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1 rounded border border-transparent px-1 py-0.5 -mx-1 hover:border-border has-[:focus]:border-accent-strong has-[:focus]:bg-surface has-[:focus]:ring-1 has-[:focus]:ring-accent/40">
                <span className="text-xs text-muted-foreground">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={product.price}
                  aria-label={`Precio de ${product.name}`}
                  onBlur={(e) => saveQuickField(product, "price", e.currentTarget)}
                  onKeyDown={(e) => handleQuickFieldKeyDown(e, String(product.price))}
                  className="w-20 min-w-0 bg-transparent tabular-nums focus:outline-none"
                />
              </div>
            </td>
            <td className="px-4 py-3">
              <input
                type="number"
                min="0"
                step="1"
                defaultValue={product.stock ?? ""}
                placeholder="—"
                title={product.stock === null ? "Sin inventario — pon un número para empezar a llevar el conteo" : undefined}
                aria-label={`Stock de ${product.name}`}
                onBlur={(e) => saveStock(product, e.currentTarget)}
                onKeyDown={(e) => handleQuickFieldKeyDown(e, product.stock === null ? "" : String(product.stock))}
                className="w-16 min-w-0 rounded border border-transparent bg-transparent px-1 py-0.5 -mx-1 tabular-nums hover:border-border focus:border-accent-strong focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
            </td>
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
                <form action={duplicateProductAction.bind(null, tenantId, tenantSlug, product.id)}>
                  <button
                    type="submit"
                    title="Crea una copia en borrador de este producto"
                    className="text-xs font-semibold uppercase text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Duplicar
                  </button>
                </form>
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
