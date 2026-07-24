import type { DSDataTableColumn } from "./DSDataTableColumn";

type Props<T> = {
  columns: DSDataTableColumn<T>[];

  sortField?: string;

  sortDirection?: "asc" | "desc";

  onSort?: (field: string) => void;
};

export default function DSDataTableHeader<T>({
  columns,
  sortField,
  sortDirection,
  onSort,
}: Props<T>) {
  return (
    <thead className="border-b bg-gray-50">
      <tr className="text-sm font-semibold uppercase tracking-wide text-gray-600">
        {columns.map((column) => {
          const active =
            sortField === column.sortKey;

          let arrow = "";

          if (column.sortable) {
            arrow = active
              ? sortDirection === "asc"
                ? "▲"
                : "▼"
              : "↕";
          }

          const alignment =
            column.align === "right"
              ? "text-right"
              : column.align === "center"
              ? "text-center"
              : "text-left";

          return (
            <th
              key={column.key}
              className={`px-6 py-4 ${alignment} ${
                column.headerClassName ?? ""
              }`}
            >
              {column.sortable ? (
                <button
                  type="button"
                  onClick={() => {
                    if (column.sortKey) {
                      onSort?.(column.sortKey);
                    }
                  }}
                  className="inline-flex items-center gap-2 font-semibold transition-colors hover:text-black"
                >
                  {column.title}

                  <span className="text-xs">
                    {arrow}
                  </span>
                </button>
              ) : (
                column.title
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}