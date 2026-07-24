import type { DSDataTableColumn } from "@/components/ui/table/DSDataTableColumn";
import type { DSTableDataSource } from "@/types/table/DSTableDataSource";
import type { DSTableState } from "@/types/table/DSTableState";

export type DSTableDataSourceOptions<T> = {
  rows: T[];
  state: DSTableState;
  columns: DSDataTableColumn<T>[];
};

export class DataSourceEngine {
  static create<T>(
    options: DSTableDataSourceOptions<T>
  ): DSTableDataSource<T> {
    return {
      rows: options.rows,
      totalRows: options.rows.length,
      page: options.state.page,
      pageSize: options.state.pageSize,
      totalPages: 1,
      sortField: options.state.sortField,
      sortDirection: options.state.sortDirection,
    };
  }
}