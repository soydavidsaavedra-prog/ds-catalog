export type DSTableSortDirection = "asc" | "desc";

export type DSTableState = {
  page: number;

  pageSize: number;

  search: string;

  sortField?: string;

  sortDirection?: DSTableSortDirection;

  filters: Record<string, unknown>;

  selectedRows: string[];
};