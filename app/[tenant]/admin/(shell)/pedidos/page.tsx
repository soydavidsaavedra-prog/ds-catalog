import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listOrders } from "@/lib/repositories/order-repository";
import { updateOrderStatusAction } from "@/app/[tenant]/admin/actions";
import { NSOrdersTable } from "@/components/admin/NSOrdersTable";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const orders = await listOrders(tenant.id);
  const changeStatus = updateOrderStatusAction.bind(null, tenant.id, tenantSlug);

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader
        title="Pedidos"
        description="El cierre de venta sigue ocurriendo por WhatsApp — este listado es solo para seguimiento interno. Cada vez que un cliente envía un pedido desde el catálogo queda registrado aquí, y si algún producto lleva control de stock, se descuenta automáticamente."
      />

      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hay pedidos registrados todavía.
        </div>
      ) : (
        <NSOrdersTable orders={orders} onChangeOrderStatus={changeStatus} />
      )}
    </div>
  );
}
