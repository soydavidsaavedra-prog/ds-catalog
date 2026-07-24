"use client";

import { ReactNode } from "react";

import type { DSDataTableColumn } from "./DSDataTableColumn";

import DSDataTableHeader from "./DSDataTableHeader";
import DSDataTableBody from "./DSDataTableBody";
import DSDataTableEmpty from "./DSDataTableEmpty";

type Props<T> = {
  data: T[];

  columns: DSDataTableColumn<T>[];

  getRowId?: (
    row: T
  ) => string | number;

  toolbar?: ReactNode;

  footer?: ReactNode;

  loading?: boolean;

  emptyMessage?: string;

  sortField?: string;

  sortDirection?: "asc" | "desc";

  onSort?: (field: string) => void;

  className?: string;
};

export default function DSDataTable<T>({
  data,
  columns,

  getRowId,

  toolbar,
  footer,

  loading = false,

  emptyMessage = "No hay registros.",

  sortField,
  sortDirection,
  onSort,

  className = "",
}: Props<T>) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {toolbar && (
        <div className="border-b bg-white">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex h-56 items-center justify-center text-gray-500">
            Cargando...
          </div>
        ) : (
          <table className="min-w-full">
            <DSDataTableHeader
              columns={columns}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />

            {data.length === 0 ? (
              <DSDataTableEmpty
                colSpan={columns.length}
                message={emptyMessage}
              />
            ) : (
              <DSDataTableBody
                data={data}
                columns={columns}
                getRowId={getRowId}
              />
            )}
          </table>
        )}
      </div>

      {footer && (
        <div className="border-t bg-white">
          {footer}
        </div>
      )}
    </div>
  );
}