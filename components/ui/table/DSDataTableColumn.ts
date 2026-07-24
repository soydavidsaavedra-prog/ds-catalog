import type { ReactNode } from "react";

export type DSDataTableAlignment =
  | "left"
  | "center"
  | "right";

export type DSDataTableColumn<T> = {
  /**
   * Identificador único.
   */
  key: string;

  /**
   * Texto mostrado en el encabezado.
   */
  title: string;

  /**
   * Permite ordenar.
   */
  sortable?: boolean;

  /**
   * Campo lógico utilizado para ordenar.
   */
  sortKey?: string;

  /**
   * Función utilizada por el SortingEngine.
   */
  sortValue?: (row: T) => unknown;

  /**
   * Alineación.
   */
  align?: DSDataTableAlignment;

  /**
   * Ancho opcional.
   */
  width?: number | string;

  /**
   * Clases del header.
   */
  headerClassName?: string;

  /**
   * Clases de la celda.
   */
  cellClassName?: string;

  /**
   * Render de la celda.
   */
  render: (row: T) => ReactNode;
};