import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { NSSettingsForm } from "@/components/admin/NSSettingsForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

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
      <DSPageHeader
        title="Configuración"
        description="Estos valores alimentan el checkout de WhatsApp, el footer y las redes sociales en todo el sitio — sin volver a desplegar."
      />
      <NSSettingsForm tenantId={tenant.id} tenantSlug={tenantSlug} settings={settings} />
    </div>
  );
}
