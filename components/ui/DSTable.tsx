import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface DSTableColumn {
  label: string;
  align?: "left" | "right";
  /** Renders a sort indicator and makes the header clickable — the caller owns the actual sort state/logic, this just shows which column is active and calls back on click. */
  sortKey?: string;
}

/**
 * The frame every admin table already shared byte-for-byte (rounded
 * card, bordered header row, uppercase muted labels, empty-state row
 * spanning every column) — was copy-pasted per page (Productos,
 * Pedidos, Clientes, Suscripciones) with the only real differences
 * being the columns and the row content, which stay fully up to the
 * caller here via `children`.
 */
export function DSTable({
  columns,
  children,
  isEmpty,
  emptyMessage = "Sin resultados.",
  sortKey,
  sortDirection,
  onSort,
  minWidth = 640,
}: {
  columns: DSTableColumn[];
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface-elevated">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map((col) => (
              <th
                key={col.label}
                className={cn("px-4 py-3 font-medium", col.align === "right" && "text-right")}
              >
                {col.sortKey && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.sortKey as string)}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                      col.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {col.label}
                    {sortKey === col.sortKey ? (
                      <span aria-hidden>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    ) : null}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
