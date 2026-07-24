import type { ReactNode } from "react";
import type { Product } from "@/types/product";

import type {
  ProductsTableSortDirection,
  ProductsTableSortField,
} from "@/engines/products/products-table.engine";

import DSDataTable from "@/components/ui/table/DSDataTable";
import type { DSDataTableColumn } from "@/components/ui/table/DSDataTableColumn";

import DSProductTableItem from "./DSProductTableItem";
import DSProductsActions from "./DSProductsActions";
import DSProductsStatus from "./DSProductsStatus";

type Props = {
  products: Product[];

  sortField: ProductsTableSortField;
  sortDirection: ProductsTableSortDirection;

  onSort: (
    field: ProductsTableSortField
  ) => void;

  toolbar?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
};

function StockBadge({
  stock,
}: {
  stock: number;
}) {
  let classes =
    "inline-flex min-w-[52px] justify-center rounded-full px-3 py-1 text-xs font-semibold";

  if (stock === 0) {
    classes += " bg-red-100 text-red-700";
  } else if (stock <= 5) {
    classes += " bg-yellow-100 text-yellow-700";
  } else {
    classes += " bg-green-100 text-green-700";
  }

  return (
    <span className={classes}>
      {stock}
    </span>
  );
}

export default function DSProductsDataTable({
  products,
  sortField,
  sortDirection,
  onSort,
  toolbar,
  footer,
  loading = false,
}: Props) {
  const columns: DSDataTableColumn<Product>[] = [
    {
      key: "name",
      title: "Producto",
      sortable: true,
      sortKey: "name",
      render: (product) => (
        <DSProductTableItem product={product} />
      ),
    },
    {
      key: "brand",
      title: "Marca",
      sortable: true,
      sortKey: "brand",
      render: (product) => product.brand,
    },
    {
      key: "category",
      title: "Categoría",
      sortable: true,
      sortKey: "category",
      render: (product) => product.category,
    },
    {
      key: "price",
      title: "Precio",
      sortable: true,
      sortKey: "price",
      align: "right",
      render: (product) =>
        new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: product.currency,
        }).format(product.price),
    },
    {
      key: "stock",
      title: "Stock",
      sortable: true,
      sortKey: "stock",
      align: "center",
      render: (product) => (
        <StockBadge stock={product.stock} />
      ),
    },
    {
      key: "active",
      title: "Estado",
      align: "center",
      render: (product) => (
        <DSProductsStatus active={product.active} />
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      align: "center",
      render: (product) => (
        <DSProductsActions id={product.id} />
      ),
    },
  ];

  return (
    <DSDataTable
      data={products}
      columns={columns}
      toolbar={toolbar}
      footer={footer}
      loading={loading}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={(field) =>
        onSort(field as ProductsTableSortField)
      }
      getRowId={(product) => product.id}
      emptyMessage="No se encontraron productos."
    />
  );
}