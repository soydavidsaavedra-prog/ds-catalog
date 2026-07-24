import type { Product } from "@/types/product";

import type { DSDataTableColumn } from "@/components/ui/table/DSDataTableColumn";
import type { DSTableDataSource } from "@/types/table/DSTableDataSource";
import type { DSTableState } from "@/types/table/DSTableState";

import { FilteringEngine } from "@/engines/table/filtering.engine";
import { SortingEngine } from "@/engines/table/sorting.engine";
import { PaginationEngine } from "@/engines/table/pagination.engine";

export type ProductsTableSortField =
  | "name"
  | "brand"
  | "category"
  | "price"
  | "stock";

export type ProductsTableSortDirection = "asc" | "desc";

export const columns: DSDataTableColumn<Product>[] = [
  {
    key: "name",
    title: "Nombre",
    sortable: true,
    sortKey: "name",
    sortValue: (product: Product) => product.name,
    render: (product: Product) => product.name,
  },
  {
    key: "brand",
    title: "Marca",
    sortable: true,
    sortKey: "brand",
    sortValue: (product: Product) => product.brand,
    render: (product: Product) => product.brand,
  },
  {
    key: "category",
    title: "Categoría",
    sortable: true,
    sortKey: "category",
    sortValue: (product: Product) => product.category,
    render: (product: Product) => product.category,
  },
  {
    key: "price",
    title: "Precio",
    sortable: true,
    sortKey: "price",
    align: "right",
    sortValue: (product: Product) => product.price,
    render: (product: Product) => product.price,
  },
  {
    key: "stock",
    title: "Stock",
    sortable: true,
    sortKey: "stock",
    align: "center",
    sortValue: (product: Product) => product.stock,
    render: (product: Product) => product.stock,
  },
];

export const productsTableEngine = {
  columns,

  getBrands(products: Product[]): string[] {
    return [...new Set(products.map((product) => product.brand))].sort();
  },

  create(
    products: Product[],
    state: DSTableState
  ): DSTableDataSource<Product> {
    const filtered = FilteringEngine.filter(
      products,
      state.filters,
      state.search,
      (product, filters, search) => {
        const brand =
          typeof filters.brand === "string" ? filters.brand : "";

        const active =
          typeof filters.active === "string" ? filters.active : "";

        const matchesSearch =
          search === "" ||
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase());

        const matchesBrand =
          brand === "" || product.brand === brand;

        const matchesActive =
          active === "" ||
          String(product.active) === active;

        return (
          matchesSearch &&
          matchesBrand &&
          matchesActive
        );
      }
    );

    const column = columns.find(
      (column) => column.sortKey === state.sortField
    );

    const sorted = SortingEngine.sort(
      filtered,
      column,
      state.sortDirection
    );

    const paginated = PaginationEngine.paginate(
      sorted,
      state.page,
      state.pageSize
    );

    return {
      rows: paginated.rows,
      totalRows: paginated.totalRows,
      page: paginated.page,
      pageSize: paginated.pageSize,
      totalPages: paginated.totalPages,
      sortField: state.sortField,
      sortDirection: state.sortDirection,
    };
  },
};