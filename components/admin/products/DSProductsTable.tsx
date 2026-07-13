import { catalogEngine } from "@/engines/catalog/catalog.engine";

import DSProductsActions from "./DSProductsActions";
import DSProductsStatus from "./DSProductsStatus";

export default function DSProductsTable() {
  const products = catalogEngine.getAllProducts();

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">

      <table className="w-full">

        <thead className="border-b bg-gray-50">

          <tr>
            <th className="px-6 py-4 text-left">
              Producto
            </th>

            <th className="px-6 py-4 text-left">
              Marca
            </th>

            <th className="px-6 py-4 text-right">
              Precio
            </th>

            <th className="px-6 py-4 text-right">
              Stock
            </th>

            <th className="px-6 py-4 text-center">
              Estado
            </th>

            <th className="px-6 py-4 text-center">
              Acciones
            </th>
          </tr>

        </thead>

        <tbody>

          {products.map((product) => (

            <tr
              key={product.id}
              className="border-b"
            >

              <td className="px-6 py-5 font-medium">
                {product.name}
              </td>

              <td className="px-6 py-5">
                {product.brand}
              </td>

              <td className="px-6 py-5 text-right">
                ${product.price}
              </td>

              <td className="px-6 py-5 text-right">
                {product.stock}
              </td>

              <td className="px-6 py-5 text-center">
                <DSProductsStatus
                  active={product.active}
                />
              </td>

              <td className="px-6 py-5 text-center">
                <DSProductsActions
                  id={product.id}
                />
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}