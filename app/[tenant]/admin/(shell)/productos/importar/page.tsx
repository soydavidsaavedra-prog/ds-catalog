import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { NSButton } from "@/components/ui/NSButton";
import { NSProductImportForm } from "@/components/admin/NSProductImportForm";

export const metadata: Metadata = {
  title: "Importar productos",
};

export default async function AdminProductImportPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <DSPageHeader
        title="Importar productos"
        description="Carga muchos productos de una vez desde un archivo CSV — útil al migrar un catálogo existente."
        actions={
          <NSButton href={`/${tenantSlug}/admin/productos/importar/plantilla`} variant="outline" size="sm">
            Descargar plantilla CSV
          </NSButton>
        }
      />

      <NSProductImportForm tenantId={tenant.id} tenantSlug={tenantSlug} />
    </div>
  );
}
