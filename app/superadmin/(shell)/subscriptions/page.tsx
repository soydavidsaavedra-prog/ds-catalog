import type { Metadata } from "next";
import Link from "next/link";
import { listSubscriptionsWithDetails } from "@/lib/repositories/subscriptions-repository";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Suscripciones",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente de aprobar",
  active: "Activa",
  trial: "Prueba",
  paused: "Pausada",
  expired: "Vencida",
  cancelled: "Cancelada",
};

export default async function SuperadminSubscriptionsPage() {
  const subscriptions = await listSubscriptionsWithDetails();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Suscripciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Se asignan desde el detalle de cada cliente. Sin cobros automáticos todavía.
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ningún cliente tiene un plan asignado todavía — ve al detalle de un cliente para asignarle uno.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Inicio</th>
                <th className="px-4 py-3 font-semibold">Vence</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr
                  key={s.id}
                  className={cn("border-b border-border last:border-0", s.status === "pending" && "bg-warning/10")}
                >
                  <td className="px-4 py-3">
                    <Link href={`/superadmin/tenants/${s.tenantId}`} className="font-medium hover:text-accent-strong">
                      {s.tenantName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{s.plan?.name ?? "—"}</td>
                  <td className={cn("px-4 py-3", s.status === "pending" && "font-semibold text-warning")}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(s.startedAt).toLocaleDateString("es")}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString("es") : "—"}
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
