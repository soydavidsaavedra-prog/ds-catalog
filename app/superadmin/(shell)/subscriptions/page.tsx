import type { Metadata } from "next";
import Link from "next/link";
import { listSubscriptionsWithDetails } from "@/lib/repositories/subscriptions-repository";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSTable } from "@/components/ui/DSTable";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";

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

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "muted" | "accent"> = {
  pending: "warning",
  active: "success",
  trial: "accent",
  paused: "muted",
  expired: "danger",
  cancelled: "danger",
};

export default async function SuperadminSubscriptionsPage() {
  const subscriptions = await listSubscriptionsWithDetails();

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader
        title="Suscripciones"
        description="Se asignan desde el detalle de cada cliente. Sin cobros automáticos todavía."
      />

      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ningún cliente tiene un plan asignado todavía — ve al detalle de un cliente para asignarle uno.
        </p>
      ) : (
        <DSTable
          columns={[
            { label: "Cliente" },
            { label: "Plan" },
            { label: "Estado" },
            { label: "Inicio" },
            { label: "Vence" },
          ]}
        >
          {subscriptions.map((s) => (
            <tr
              key={s.id}
              className={`border-b border-border last:border-0 hover:bg-surface ${s.status === "pending" ? "bg-warning/5" : ""}`}
            >
              <td className="px-4 py-3">
                <Link href={`/superadmin/tenants/${s.tenantId}`} className="font-medium hover:text-accent-strong">
                  {s.tenantName}
                </Link>
              </td>
              <td className="px-4 py-3">{s.plan?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <DSStatusBadge label={STATUS_LABEL[s.status] ?? s.status} tone={STATUS_TONE[s.status] ?? "muted"} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {new Date(s.startedAt).toLocaleDateString("es")}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString("es") : "—"}
              </td>
            </tr>
          ))}
        </DSTable>
      )}
    </div>
  );
}
