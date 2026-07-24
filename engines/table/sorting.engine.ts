import type { DSDataTableColumn } from "@/components/ui/table/DSDataTableColumn";
import type { DSTableSortDirection } from "@/types/table/DSTableState";

export class SortingEngine {
  static sort<T>(
    rows: T[],
    column: DSDataTableColumn<T> | undefined,
    direction: DSTableSortDirection = "asc"
  ): T[] {
    if (
      !column ||
      !column.sortable ||
      typeof column.sortValue !== "function"
    ) {
      return [...rows];
    }

    const getValue = column.sortValue;

    return [...rows].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);

      if (valueA === valueB) {
        return 0;
      }

      if (valueA == null) {
        return 1;
      }

      if (valueB == null) {
        return -1;
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }

      return direction === "asc" ? 1 : -1;
    });
  }
}