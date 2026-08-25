"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types/catalog";
import { formatPrice, availabilityLabel } from "@/lib/utils/format";
import { NSInput, NSSelect } from "@/components/ui/NSInput";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { deleteProductAction } from "@/app/[tenant]/admin/actions";

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
  const categoryName = new Map(categoryOptions);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || p.categorySlug === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, categoryFilter]);

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

      <div className="overflow-x-auto rounded-card border border-border bg-surface-elevated">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Activo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
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
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{availabilityLabel[product.availability]}</td>
                  <td className="px-4 py-3">
                    <span className={product.active ? "text-success" : "text-muted-foreground"}>
                      {product.active ? "Sí" : "No"}
                    </span>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
