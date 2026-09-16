import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listSocialAccounts } from "@/lib/repositories/social-accounts-repository";
import { getLatestSnapshotByAccount } from "@/lib/repositories/social-metrics-repository";
import { NSSyncMetricsButton } from "@/components/admin/social/NSSyncMetricsButton";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/types/social";

export const metadata: Metadata = { title: "Analíticas de redes sociales" };

function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-control border border-border bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-foreground">{value === null ? "—" : value.toLocaleString("es")}</p>
    </div>
  );
}

export default async function SocialAnalyticsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const accounts = await listSocialAccounts(tenant.id);
  const snapshots = await Promise.all(accounts.map((account) => getLatestSnapshotByAccount(account.id)));

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <DSPageHeader
        title="Analíticas"
        description="Seguidores y engagement de cada cuenta conectada, según la última sincronización manual — este panel no consulta la API en cada visita, solo cuando pulsas «Sincronizar ahora»."
      />

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Conecta una cuenta en <a className="underline" href={`/${tenantSlug}/admin/redes-sociales/cuentas`}>Cuentas</a> para ver analíticas.
        </p>
      ) : (
        accounts.map((account, index) => {
          const snapshot = snapshots[index];
          return (
            <DSCard
              key={account.id}
              title={account.displayName}
              description={SOCIAL_PLATFORM_LABELS[account.platform]}
              actions={<NSSyncMetricsButton tenantId={tenant.id} tenantSlug={tenantSlug} accountId={account.id} />}
            >
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Seguidores" value={snapshot?.followersCount ?? null} />
                <StatTile label="Engagement" value={snapshot?.engagementCount ?? null} />
                <StatTile label="Alcance/Impresiones" value={snapshot?.impressionsCount ?? null} />
              </div>
              {snapshot ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Última sincronización: {new Date(snapshot.capturedAt).toLocaleString("es")}
                </p>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">Todavía no se sincronizó esta cuenta.</p>
              )}
            </DSCard>
          );
        })
      )}
    </div>
  );
}
