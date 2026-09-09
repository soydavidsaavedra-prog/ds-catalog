import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { NSDomainSettings } from "@/components/admin/NSDomainSettings";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

export const metadata: Metadata = {
  title: "Dominio",
};

export default async function AdminDomainPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <DSPageHeader
        title="Dominio propio"
        description="Conecta tu propio dominio (ej. tutienda.com) para que tus clientes vean tu catálogo ahí en vez de bajo el dominio de DS Catalog."
      />

      <NSDomainSettings
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        currentDomain={tenant.customDomain}
        verified={tenant.customDomainVerified}
      />
    </div>
  );
}
