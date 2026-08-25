import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { NSSettingsForm } from "@/components/admin/NSSettingsForm";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const settings = await getSettings(tenant.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estos valores alimentan el checkout de WhatsApp, el footer y las redes sociales en todo
          el sitio — sin volver a desplegar.
        </p>
      </div>
      <div className="max-w-xl rounded-card border border-border bg-surface-elevated p-6">
        <NSSettingsForm tenantId={tenant.id} tenantSlug={tenantSlug} settings={settings} />
      </div>
    </div>
  );
}
