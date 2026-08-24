"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { SortOption } from "@/lib/types/catalog";
import { cn } from "@/lib/utils/cn";

interface NSFilterBarProps {
  categories?: { slug: string; name: string }[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  resultCount: number;
}

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Destacados",
  newest: "Nuevos",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
  "name-asc": "Nombre",
};

export function NSFilterBar({ categories, sizes, colors, resultCount }: NSFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSizes = searchParams.get("talla")?.split(",").filter(Boolean) ?? [];
  const activeColors = searchParams.get("color")?.split(",").filter(Boolean) ?? [];
  const activeAvailability = searchParams.get("disponibilidad")?.split(",").filter(Boolean) ?? [];
  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = (searchParams.get("sort") as SortOption) ?? "featured";

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const toggleListParam = (key: string, value: string, current: string[]) => {
    pushParams((params) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length === 0) params.delete(key);
      else params.set(key, next.join(","));
    });
  };

  const activeFilterCount =
    activeSizes.length + activeColors.length + activeAvailability.length + (activeCategory ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
      {categories && categories.length > 0 ? (
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-control border border-border-strong px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground [&::-webkit-details-marker]:hidden">
            <TagIcon /> Categoría {activeCategory ? "· 1" : ""}
          </summary>
          <div className="absolute left-0 top-full z-20 mt-2 flex w-52 flex-col gap-1 rounded-card border border-border bg-surface-elevated p-3 shadow-modal">
            <button
              type="button"
              onClick={() => pushParams((p) => p.delete("category"))}
              className={cn("rounded-control px-2 py-1.5 text-left text-xs font-medium hover:bg-surface", !activeCategory && "text-accent-strong")}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => pushParams((p) => p.set("category", c.slug))}
                className={cn("rounded-control px-2 py-1.5 text-left text-xs font-medium hover:bg-surface", activeCategory === c.slug && "text-accent-strong")}
              >
                {c.name}
              </button>
            ))}
          </div>
        </details>
      ) : null}

      {sizes.length > 0 ? (
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-control border border-border-strong px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground [&::-webkit-details-marker]:hidden">
            <SizeIcon /> Talla {activeSizes.length ? `· ${activeSizes.length}` : ""}
          </summary>
          <div className="absolute left-0 top-full z-20 mt-2 flex w-56 flex-wrap gap-2 rounded-card border border-border bg-surface-elevated p-3 shadow-modal">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleListParam("talla", size, activeSizes)}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-control border px-2 text-xs font-semibold",
                  activeSizes.includes(size)
                    ? "border-accent-strong bg-accent text-accent-foreground"
                    : "border-border-strong text-foreground hover:border-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </details>
      ) : null}

      {colors.length > 0 ? (
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-control border border-border-strong px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground [&::-webkit-details-marker]:hidden">
            <ColorIcon /> Color {activeColors.length ? `· ${activeColors.length}` : ""}
          </summary>
          <div className="absolute left-0 top-full z-20 mt-2 flex w-56 flex-col gap-1 rounded-card border border-border bg-surface-elevated p-3 shadow-modal">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleListParam("color", color.name, activeColors)}
                className={cn(
                  "flex items-center gap-2 rounded-control px-2 py-1.5 text-left text-xs font-medium hover:bg-surface",
                  activeColors.includes(color.name) && "text-accent-strong",
                )}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-border-strong" style={{ backgroundColor: color.hex }} />
                {color.name}
              </button>
            ))}
          </div>
        </details>
      ) : null}

      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-control border border-border-strong px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground [&::-webkit-details-marker]:hidden">
          <StockIcon /> Disponibilidad {activeAvailability.length ? `· ${activeAvailability.length}` : ""}
        </summary>
        <div className="absolute left-0 top-full z-20 mt-2 flex w-56 flex-col gap-1 rounded-card border border-border bg-surface-elevated p-3 shadow-modal">
          {[
            { value: "in_stock", label: "Disponible" },
            { value: "low_stock", label: "Pocas unidades" },
            { value: "out_of_stock", label: "Agotado" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleListParam("disponibilidad", opt.value, activeAvailability)}
              className={cn(
                "rounded-control px-2 py-1.5 text-left text-xs font-medium hover:bg-surface",
                activeAvailability.includes(opt.value) && "text-accent-strong",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </details>

      {activeFilterCount > 0 ? (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-danger hover:underline"
        >
          Limpiar filtros
        </button>
      ) : null}

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">{resultCount} productos</span>
        <select
          aria-label="Ordenar por"
          value={activeSort}
          onChange={(e) => pushParams((p) => (e.target.value === "featured" ? p.delete("sort") : p.set("sort", e.target.value)))}
          className="h-9 rounded-control border border-border-strong bg-surface-elevated px-2.5 text-xs font-medium"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2 7.5 7.5 2H13a1 1 0 0 1 1 1v5.5L8.5 14a1 1 0 0 1-1.4 0L2 8.9a1 1 0 0 1 0-1.4Z" />
      <circle cx="10" cy="5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function SizeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2 5h12v6H2z" />
      <path d="M5 5v2M8 5v3M11 5v2" />
    </svg>
  );
}
function ColorIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}
function StockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="m2 5 6-3 6 3-6 3-6-3Z" />
      <path d="M2 5v6l6 3 6-3V5M8 8v6" />
    </svg>
  );
}
