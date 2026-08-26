import Link from "next/link";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { listOrders } from "@/lib/repositories/order-repository";
import { formatPrice } from "@/lib/utils/format";
import { NSWelcomeBanner } from "@/components/admin/NSWelcomeBanner";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSStatCard } from "@/components/ui/DSStatCard";
import { NSButton } from "@/components/ui/NSButton";

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
  const outOfStockCount = products.filter((p) => p.availability === "out_of_stock").length;
  const newOrdersCount = orders.filter((o) => o.status === "new").length;

  const stats = [
    { label: "Productos activos", value: products.filter((p) => p.active).length, href: `${base}/productos`, icon: <ProductIcon className="h-4 w-4" /> },
    {
      label: "Sin stock",
      value: outOfStockCount,
      href: `${base}/productos`,
      icon: <StockIcon className="h-4 w-4" />,
      tone: outOfStockCount > 0 ? ("warning" as const) : ("default" as const),
    },
    { label: "Categorías", value: categories.length, href: `${base}/categorias`, icon: <CategoryIcon className="h-4 w-4" /> },
    {
      label: "Pedidos nuevos",
      value: newOrdersCount,
      href: `${base}/pedidos`,
      icon: <OrderIcon className="h-4 w-4" />,
      tone: newOrdersCount > 0 ? ("success" as const) : ("default" as const),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {bienvenida === "1" ? <NSWelcomeBanner brandName={tenant.name} /> : null}
      <DSPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Resumen general de tu catálogo y tu actividad reciente."
        actions={
          <NSButton href={`${base}/productos/nuevo`} size="sm" icon={<PlusIcon className="h-4 w-4" />}>
            Nuevo producto
          </NSButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <DSStatCard key={stat.label} label={stat.label} value={stat.value} href={stat.href} icon={stat.icon} tone={stat.tone} />
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface-elevated">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg uppercase tracking-wide">Pedidos recientes</h2>
          {orders.length > 0 ? (
            <Link href={`${base}/pedidos`} className="text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline">
              Ver todos →
            </Link>
          ) : null}
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <OrderIcon className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">Todavía no hay pedidos</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Los pedidos enviados por WhatsApp se cierran directamente en el chat; este listado es solo para
              seguimiento interno.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Fecha</th>
                  <th className="px-5 py-2.5 font-medium">Artículos</th>
                  <th className="px-5 py-2.5 font-medium">Total</th>
                  <th className="px-5 py-2.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">{new Date(order.createdAt).toLocaleDateString("es-VE")}</td>
                    <td className="px-5 py-3">{order.items.length}</td>
                    <td className="px-5 py-3">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3 capitalize">{order.status}</td>
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

function iconProps() {
  return { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
}
function ProductIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M3 6l7-3.5L17 6v8l-7 3.5L3 14V6Z" /><path d="M3 6l7 3.5L17 6M10 9.5V17" /></svg>;
}
function StockIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M10 2.5 3 6v8l7 3.5 7-3.5V6z" /><path d="M10 10 3 6M10 10l7-4M10 10v7.5" /><path d="M10 6.5 6.5 8.3" opacity="0.5" /></svg>;
}
function CategoryIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M2 10 10 2l8 8-8 8-8-8Z" /><circle cx="12.5" cy="7.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
function OrderIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M4 3h12l-1 12H5L4 3Z" /><path d="M7 3a3 3 0 0 1 6 0M4 7h12" /></svg>;
}
function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M10 4v12M4 10h12" /></svg>;
}
