import Link from "next/link";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { listOrders } from "@/lib/repositories/order-repository";
import { formatPrice } from "@/lib/utils/format";
import { NSWelcomeBanner } from "@/components/admin/NSWelcomeBanner";

export default async function AdminDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ bienvenida?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const { bienvenida } = await searchParams;
  const tenant = await resolveTenant(tenantSlug);
  const [products, categories, orders] = await Promise.all([
    listProducts(tenant.id),
    listCategories(tenant.id),
    listOrders(tenant.id),
  ]);
  const base = `/${tenantSlug}/admin`;

  const stats = [
    { label: "Productos activos", value: products.filter((p) => p.active).length, href: `${base}/productos` },
    { label: "Sin stock", value: products.filter((p) => p.availability === "out_of_stock").length, href: `${base}/productos` },
    { label: "Categorías", value: categories.length, href: `${base}/categorias` },
    { label: "Pedidos nuevos", value: orders.filter((o) => o.status === "new").length, href: `${base}/pedidos` },
  ];

  return (
    <div className="flex flex-col gap-8">
      {bienvenida === "1" ? <NSWelcomeBanner brandName={tenant.name} /> : null}
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Resumen general de la tienda.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-card border border-border bg-surface-elevated p-5 transition-colors hover:border-accent-strong"
          >
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface-elevated p-5">
        <h2 className="font-display text-xl uppercase tracking-wide">Pedidos recientes</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Todavía no hay pedidos registrados. Los pedidos enviados por WhatsApp se cierran
            directamente en el chat; este listado es para seguimiento interno.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Artículos</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-2.5">{new Date(order.createdAt).toLocaleDateString("es-VE")}</td>
                    <td className="py-2.5">{order.items.length}</td>
                    <td className="py-2.5">{formatPrice(order.total)}</td>
                    <td className="py-2.5 capitalize">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
