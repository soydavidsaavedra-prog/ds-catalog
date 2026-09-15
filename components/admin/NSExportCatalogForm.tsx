"use client";

import { useMemo, useState } from "react";
import { NSButton } from "@/components/ui/NSButton";
import { NSLabel, NSSelect } from "@/components/ui/NSInput";
import { DSCard } from "@/components/ui/DSCard";
import type { Category, Product } from "@/lib/types/catalog";

type Scope = "all" | "category" | "selection";

const SCOPE_OPTIONS: { value: Scope; label: string; description: string }[] = [
  { value: "all", label: "Todo el catálogo", description: "Todos tus productos activos, agrupados por categoría." },
  { value: "category", label: "Una categoría", description: "Solo los productos de la categoría que elijas." },
  { value: "selection", label: "Selección manual", description: "Elige producto por producto cuáles incluir." },
];

export function NSExportCatalogForm({
  tenantSlug,
  products,
  categories,
}: {
  tenantSlug: string;
  products: Product[];
  categories: Category[];
}) {
  const [scope, setScope] = useState<Scope>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = useMemo(
    () => categories.filter((c) => products.some((p) => p.active && p.categorySlug === c.slug)),
    [categories, products],
  );
  const [categorySlug, setCategorySlug] = useState(categoryOptions[0]?.slug ?? "");

  function handleSubmit() {
    setSubmitting(true);
    // A plain form POST to a file-download route never fires a JS "done"
    // event — the browser just starts saving the response and stays on
    // this page — so there's no real completion signal to reset this on.
    // A few seconds is enough for the PDF to generate and the browser's
    // save prompt to appear, after which a stuck spinner would be worse
    // than letting the button go clickable again.
    setTimeout(() => setSubmitting(false), 4000);
  }

  function toggleProduct(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const selectionCount = selectedIds.size;
  const canSubmit =
    scope === "all" || (scope === "category" && Boolean(categorySlug)) || (scope === "selection" && selectionCount > 0);

  return (
    <form
      action={`/${tenantSlug}/admin/productos/exportar/descargar`}
      method="POST"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <DSCard title="¿Qué quieres exportar?">
        <div className="flex flex-col gap-3">
          {SCOPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-control border border-border bg-surface px-4 py-3 has-[:checked]:border-accent-strong has-[:checked]:bg-accent/5"
            >
              <input
                type="radio"
                name="scope"
                value={option.value}
                checked={scope === option.value}
                onChange={() => setScope(option.value)}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </DSCard>

      {scope === "category" ? (
        <DSCard title="Categoría">
          {categoryOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay categorías con productos activos todavía.</p>
          ) : (
            <div>
              <NSLabel htmlFor="category">Categoría a exportar</NSLabel>
              <NSSelect id="category" name="category" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </NSSelect>
            </div>
          )}
        </DSCard>
      ) : null}

      {scope === "selection" ? (
        <DSCard title={`Selecciona productos (${selectionCount} elegido${selectionCount === 1 ? "" : "s"})`}>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no tienes productos.</p>
          ) : (
            <div className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto rounded-control border border-border">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface">
                  <input
                    type="checkbox"
                    name="ids"
                    value={product.id}
                    checked={selectedIds.has(product.id)}
                    onChange={(e) => toggleProduct(product.id, e.target.checked)}
                    className="accent-accent"
                  />
                  <span className="flex-1 truncate text-foreground">{product.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{product.reference}</span>
                  {!product.active ? <span className="shrink-0 text-xs text-muted-foreground">(inactivo)</span> : null}
                </label>
              ))}
            </div>
          )}
        </DSCard>
      ) : null}

      <div className="flex items-center gap-3">
        <NSButton type="submit" disabled={!canSubmit} loading={submitting}>
          Generar PDF
        </NSButton>
        <NSButton href={`/${tenantSlug}/admin/productos`} variant="outline">
          Cancelar
        </NSButton>
      </div>
    </form>
  );
}
