import { listOrders } from "@/lib/repositories/order-repository";
import { formatPrice } from "@/lib/utils/format";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { NSOrderStatusSelect } from "@/components/admin/NSOrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Pedidos</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          El cierre de venta ocurre por WhatsApp. Este listado es para seguimiento interno de
          pedidos que decidas registrar manualmente a futuro — hoy está vacío porque el flujo de
          checkout envía el pedido directo al chat sin pasar por el servidor.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hay pedidos registrados todavía.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface-elevated">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Artículos</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleString("es-VE")}</td>
                  <td className="px-4 py-3">{order.customerName ?? "—"}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <NSOrderStatusSelect
                      status={order.status}
                      onChangeStatus={updateOrderStatusAction.bind(null, order.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
