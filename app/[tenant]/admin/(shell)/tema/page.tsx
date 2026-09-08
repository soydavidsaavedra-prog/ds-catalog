import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getEffectivePlanForTenant } from "@/lib/tenant/plan-limits";
import { NSThemeSelector } from "@/components/admin/NSThemeSelector";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

export const metadata: Metadata = {
  title: "Tema",
};

export default async function AdminThemePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const plan = await getEffectivePlanForTenant(tenant.id);

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <DSPageHeader
        title="Tema"
        description="Elige la experiencia visual de tu catálogo público. El contenido (Inicio) es independiente del tema y se mantiene igual."
      />

      <NSThemeSelector
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        currentTheme={tenant.theme}
        allowedThemes={plan?.allowedThemes ?? null}
      />
    </div>
  );
}
