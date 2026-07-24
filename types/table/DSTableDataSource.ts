import type { DSTableSortDirection } from "./DSTableState";

export type DSTableDataSource<T> = {
  /**
   * Registros que se mostrarán en la página actual.
   */
  rows: T[];

  /**
   * Total de registros antes de paginar.
   */
  totalRows: number;

  /**
   * Página actual.
   */
  page: number;

  /**
   * Cantidad de registros por página.
   */
  pageSize: number;

  /**
   * Total de páginas.
   */
  totalPages: number;

  /**
   * Campo actualmente ordenado.
   */
  sortField?: string;

  /**
   * Dirección del ordenamiento.
   */
  sortDirection?: DSTableSortDirection;
};