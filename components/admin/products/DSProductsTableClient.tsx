"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/types/product";
import type { DSTableState } from "@/types/table/DSTableState";

import {
  productsTableEngine,
  type ProductsTableSortDirection,
  type ProductsTableSortField,
} from "@/engines/products/products-table.engine";

import DSPagination from "@/components/ui/table/DSPagination";

import DSProductsToolbar from "./DSProductsToolbar";
import DSProductsDataTable from "./DSProductsDataTable";

type Props = {
  products: Product[];
};

const PAGE_SIZE = 10;

export default function DSProductsTableClient({
  products,
}: Props) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [active, setActive] = useState("");

  const [page, setPage] = useState(1);

  const [sortField, setSortField] =
    useState<ProductsTableSortField>("name");

  const [sortDirection, setSortDirection] =
    useState<ProductsTableSortDirection>("asc");

  const brands = useMemo(() => {
    return productsTableEngine.getBrands(products);
  }, [products]);

  const tableState: DSTableState = {
    page,
    pageSize: PAGE_SIZE,
    search,
    sortField,
    sortDirection,
    filters: {
      brand,
      active,
    },
    selectedRows: [],
  };

  const processed = useMemo(() => {
    return productsTableEngine.create(
      products,
      tableState
    );
  }, [products, tableState]);

  function handleSort(
    field: ProductsTableSortField
  ) {
    setPage(1);

    if (field === sortField) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  }

  return (
    <DSProductsDataTable
      products={processed.rows}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
      toolbar={
        <DSProductsToolbar
          search={search}
          brand={brand}
          active={active}
          brands={brands}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onBrandChange={(value) => {
            setBrand(value);
            setPage(1);
          }}
          onActiveChange={(value) => {
            setActive(value);
            setPage(1);
          }}
        />
      }
      footer={
        <DSPagination
          page={processed.page}
          totalPages={processed.totalPages}
          onPrevious={() =>
            setPage((p) => Math.max(1, p - 1))
          }
          onNext={() =>
            setPage((p) =>
              Math.min(processed.totalPages, p + 1)
            )
          }
        />
      }
    />
  );
}