import Link from "next/link";
import { listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { formatPrice, availabilityLabel } from "@/lib/utils/format";
import { NSButton } from "@/components/ui/NSButton";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { deleteProductAction } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wide">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} productos en catálogo.</p>
        </div>
        <NSButton href="/admin/productos/nuevo" size="sm">+ Nuevo producto</NSButton>
      </div>

      <div className="overflow-x-auto rounded-card border border-border bg-surface-elevated">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Activo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded-control">
                      <NSMedia src={product.images[0]} alt={product.name} reference={product.reference} sizes="40px" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.reference}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{categoryName.get(product.categorySlug) ?? product.categorySlug}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-muted-foreground">{availabilityLabel[product.availability]}</td>
                <td className="px-4 py-3">
                  <span className={product.active ? "text-success" : "text-muted-foreground"}>
                    {product.active ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/productos/${product.id}`} className="text-xs font-semibold uppercase text-accent-strong hover:underline">
                      Editar
                    </Link>
                    <NSAdminDeleteButton
                      action={deleteProductAction.bind(null, product.id)}
                      confirmMessage={`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
