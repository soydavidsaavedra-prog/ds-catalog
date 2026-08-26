import Link from "next/link";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listProducts } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { listOrders } from "@/lib/repositories/order-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getEffectivePlanForTenant, getPlanStatusInfo } from "@/lib/tenant/plan-limits";
import { getStorageUsageForSlug } from "@/lib/repositories/storage-repository";
import { formatPrice, formatBytes } from "@/lib/utils/format";
import { NSWelcomeBanner } from "@/components/admin/NSWelcomeBanner";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSStatCard } from "@/components/ui/DSStatCard";
import { DSActivityRow } from "@/components/ui/DSActivityRow";
import { NSReveal } from "@/components/ui/NSReveal";
import { NSButton } from "@/components/ui/NSButton";
import type { Order } from "@/lib/types/order";
import type { Product } from "@/lib/types/catalog";

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
  const [products, categories, orders, settings, plan, planStatus, storage] = await Promise.all([
    listProducts(tenant.id),
    listCategories(tenant.id),
    listOrders(tenant.id),
    getSettings(tenant.id),
    getEffectivePlanForTenant(tenant.id),
    getPlanStatusInfo(tenant.id),
    getStorageUsageForSlug(tenantSlug),
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

  // A real, mixed timeline from the two things that actually have a
  // timestamp to sort by — no invented "activity log" table, just the
  // orders and products that already exist, interleaved by when they
  // happened.
  type ActivityEntry =
    | { kind: "order"; at: string; order: Order }
    | { kind: "product"; at: string; product: Product };
  const activity: ActivityEntry[] = [
    ...orders.map((order): ActivityEntry => ({ kind: "order", at: order.createdAt, order })),
    ...products.map((product): ActivityEntry => ({ kind: "product", at: product.createdAt, product })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  const storageUsedMb = storage.totalBytes / (1024 * 1024);
  const storagePercent = plan?.maxStorageMb ? Math.min(100, (storageUsedMb / plan.maxStorageMb) * 100) : null;
  const productsPercent = plan?.maxProducts ? Math.min(100, (products.length / plan.maxProducts) * 100) : null;

  const alerts: { title: string; href: string; tone: "warning" | "danger" }[] = [];
  if (products.length === 0) {
    alerts.push({ title: "Todavía no tienes productos cargados", href: `${base}/productos/nuevo`, tone: "warning" });
  }
  if (categories.length === 0) {
    alerts.push({ title: "Todavía no tienes categorías", href: `${base}/categorias`, tone: "warning" });
  }
  if (!settings.whatsappNumber) {
    alerts.push({ title: "No configuraste tu WhatsApp para recibir pedidos", href: `${base}/configuracion`, tone: "danger" });
  }
  if (storagePercent !== null && storagePercent >= 80) {
    alerts.push({ title: "Estás cerca del límite de almacenamiento de tu plan", href: `${base}/cuenta`, tone: "danger" });
  }

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

      <NSReveal y={12}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <DSStatCard key={stat.label} label={stat.label} value={stat.value} href={stat.href} icon={stat.icon} tone={stat.tone} />
          ))}
        </div>
      </NSReveal>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface-elevated lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-lg uppercase tracking-wide">Actividad reciente</h2>
            {orders.length > 0 ? (
              <Link href={`${base}/pedidos`} className="text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline">
                Ver pedidos →
              </Link>
            ) : null}
          </div>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <OrderIcon className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Todavía no hay actividad</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                En cuanto agregues productos o lleguen pedidos por WhatsApp, los vas a ver aquí.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {activity.map((entry) =>
                entry.kind === "order" ? (
                  <DSActivityRow
                    key={`order-${entry.order.id}`}
                    icon={<OrderIcon className="h-4 w-4" />}
                    title={`Pedido de ${entry.order.items.length} artículo${entry.order.items.length === 1 ? "" : "s"} — ${formatPrice(entry.order.total)}`}
                    meta={new Date(entry.order.createdAt).toLocaleDateString("es-VE")}
                    href={`${base}/pedidos`}
                  />
                ) : (
                  <DSActivityRow
                    key={`product-${entry.product.id}`}
                    icon={<ProductIcon className="h-4 w-4" />}
                    title={`Producto agregado: ${entry.product.name}`}
                    meta={new Date(entry.product.createdAt).toLocaleDateString("es-VE")}
                    href={`${base}/productos/${entry.product.id}`}
                  />
                ),
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-card border border-border bg-surface-elevated p-5">
            <h2 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Plan y almacenamiento</h2>
            <p className="mt-2 font-display text-2xl">{plan?.name ?? "Sin límite"}</p>
            {planStatus.daysUntilExpiry !== null ? (
              <p className="mt-1 text-xs text-muted-foreground">Se renueva en {planStatus.daysUntilExpiry} días</p>
            ) : null}
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Almacenamiento</span>
                  <span>{plan?.maxStorageMb ? `${formatBytes(storage.totalBytes)} / ${plan.maxStorageMb} MB` : formatBytes(storage.totalBytes)}</span>
                </div>
                {storagePercent !== null ? (
                  <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface">
                    <div
                      className={`h-full rounded-pill ${storagePercent >= 80 ? "bg-danger" : "bg-accent"}`}
                      style={{ width: `${Math.max(2, storagePercent)}%` }}
                    />
                  </div>
                ) : null}
              </div>
              {plan?.maxProducts ? (
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Productos</span>
                    <span>{products.length} / {plan.maxProducts}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface">
                    <div
                      className={`h-full rounded-pill ${productsPercent !== null && productsPercent >= 80 ? "bg-danger" : "bg-accent"}`}
                      style={{ width: `${Math.max(2, productsPercent ?? 0)}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <Link href={`${base}/cuenta`} className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline">
              Ver mi plan →
            </Link>
          </div>

          <div className="rounded-card border border-border bg-surface-elevated p-5">
            <h2 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Acciones rápidas</h2>
            <div className="mt-3 flex flex-col gap-2">
              <NSButton href={`${base}/productos/nuevo`} variant="outline" size="sm" className="justify-start">
                Nuevo producto
              </NSButton>
              <NSButton href={`${base}/categorias`} variant="outline" size="sm" className="justify-start">
                Nueva categoría
              </NSButton>
              <NSButton href={`${base}/inicio`} variant="outline" size="sm" className="justify-start">
                Editar portada
              </NSButton>
              <NSButton href={`${base}/configuracion`} variant="outline" size="sm" className="justify-start">
                Configuración
              </NSButton>
            </div>
          </div>

          {alerts.length > 0 ? (
            <div className="rounded-card border border-border bg-surface-elevated p-5">
              <h2 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Alertas</h2>
              <div className="mt-3 flex flex-col gap-2">
                {alerts.map((alert) => (
                  <DSActivityRow key={alert.title} title={alert.title} href={alert.href} tone={alert.tone} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
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
