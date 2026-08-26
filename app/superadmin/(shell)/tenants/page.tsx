import type { Metadata } from "next";
import Link from "next/link";
import { listAllTenantsWithCounts } from "@/lib/repositories/superadmin-repository";
import { NSTenantsTable } from "@/components/superadmin/NSTenantsTable";
import { NSButton } from "@/components/ui/NSButton";
import { DSPageHeader } from "@/components/ui/DSPageHeader";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function SuperadminTenantsPage() {
  const tenants = await listAllTenantsWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader
        title="Clientes"
        description={`${tenants.length} catálogos en la plataforma.`}
        actions={
          <Link href="/superadmin/tenants/nuevo">
            <NSButton>Nuevo cliente</NSButton>
          </Link>
        }
      />

      <NSTenantsTable tenants={tenants} />
    </div>
  );
}
