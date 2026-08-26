"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Availability, Product } from "@/lib/types/catalog";
import { formatPrice, availabilityLabel } from "@/lib/utils/format";
import { NSInput, NSSelect } from "@/components/ui/NSInput";
import { NSMedia } from "@/components/ui/NSMedia";
import { DSTable } from "@/components/ui/DSTable";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { deleteProductAction } from "@/app/[tenant]/admin/actions";

const AVAILABILITY_TONE: Record<Availability, "success" | "warning" | "danger"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
};

type SortKey = "name" | "price";

export function NSProductsTable({
  tenantId,
  tenantSlug,
  products,
  categoryOptions,
}: {
  tenantId: string;
  tenantSlug: string;
  products: Product[];
  /** [slug, name][] — only categories that actually have products, in display order. */
  categoryOptions: [string, string][];
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const categoryName = new Map(categoryOptions);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || p.categorySlug === categoryFilter;
      return matchesQuery && matchesCategory;
    });
    if (!sortKey) return result;
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...result].sort((a, b) => {
      if (sortKey === "price") return (a.price - b.price) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
  }, [products, query, categoryFilter, sortKey, sortDirection]);

  function handleSort(key: string) {
    if (key !== "name" && key !== "price") return;
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

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
        <p className="text-xs text-muted-foreground sm:ml-auto">
          {filtered.length} de {products.length} productos
        </p>
      </div>

      <DSTable
        minWidth={720}
        isEmpty={filtered.length === 0}
        emptyMessage="Sin resultados."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        columns={[
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
              <DSStatusBadge label={product.active ? "Activo" : "Inactivo"} tone={product.active ? "success" : "muted"} />
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
