import type { Metadata } from "next";
import Link from "next/link";
import { listAuditLog } from "@/lib/audit/audit-log";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSTable } from "@/components/ui/DSTable";

export const metadata: Metadata = {
  title: "Auditoría",
};

const COLUMNS = [
  { label: "Fecha" },
  { label: "Quién" },
  { label: "Cliente" },
  { label: "Acción" },
];

export default async function SuperadminAuditLogPage() {
  const entries = await listAuditLog(200);

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader
        title="Auditoría"
        description="Registro de acciones administrativas desde Super Admin — quién hizo qué y cuándo. No incluye acciones de solo lectura ni lo que hace cada cliente en su propio panel. Muestra las últimas 200 entradas."
      />

      <DSTable columns={COLUMNS} isEmpty={entries.length === 0} emptyMessage="Todavía no hay acciones registradas.">
        {entries.map((entry) => (
          <tr key={entry.id} className="border-b border-border last:border-0">
            <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleString("es")}
            </td>
            <td className="px-4 py-3 text-xs">{entry.actorEmail}</td>
            <td className="px-4 py-3 text-xs">
              {entry.tenantId && entry.action !== "tenant.deleted" ? (
                <Link href={`/superadmin/tenants/${entry.tenantId}`} className="text-accent-strong hover:underline">
                  {entry.tenantSlug ?? entry.tenantId}
                </Link>
              ) : entry.tenantSlug ? (
                <span className="text-muted-foreground">{entry.tenantSlug} (eliminado)</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </td>
            <td className="px-4 py-3 text-sm">{entry.summary}</td>
          </tr>
        ))}
      </DSTable>
    </div>
  );
}
