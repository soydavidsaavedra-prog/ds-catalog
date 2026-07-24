import {
    FilteringEngine,
    type DSTableFilterFunction,
  } from "./filtering.engine";
  import { SortingEngine } from "./sorting.engine";
  import { PaginationEngine } from "./pagination.engine";
  
  import type { DSDataTableColumn } from "@/components/ui/table/DSDataTableColumn";
  import type { DSTableDataSource } from "@/types/table/DSTableDataSource";
  import type { DSTableState } from "@/types/table/DSTableState";
  
  export type TablePipelineOptions<T> = {
    rows: T[];
    state: DSTableState;
    columns: DSDataTableColumn<T>[];
    filter: DSTableFilterFunction<T>;
  };
  
  export class TablePipelineEngine {
    static create<T>(
      options: TablePipelineOptions<T>
    ): DSTableDataSource<T> {
      const filteredRows = FilteringEngine.filter(
        options.rows,
        options.state.filters,
        options.state.search,
        options.filter
      );
  
      const column = options.columns.find(
        (column) => column.sortKey === options.state.sortField
      );
  
      const sortedRows = SortingEngine.sort(
        filteredRows,
        column,
        options.state.sortDirection
      );
  
      const paginated = PaginationEngine.paginate(
        sortedRows,
        options.state.page,
        options.state.pageSize
      );
  
      return {
        rows: paginated.rows,
        totalRows: paginated.totalRows,
        page: paginated.page,
        pageSize: paginated.pageSize,
        totalPages: paginated.totalPages,
        sortField: options.state.sortField,
        sortDirection: options.state.sortDirection,
      };
    }
  }