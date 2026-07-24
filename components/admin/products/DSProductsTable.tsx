import { catalogEngine } from "@/engines/catalog/catalog.engine";

import DSProductsTableClient from "./DSProductsTableClient";

export default async function DSProductsTable() {
  const products =
    await catalogEngine.getAllProducts();

  return (
    <DSProductsTableClient
      products={products}
    />
  );
}