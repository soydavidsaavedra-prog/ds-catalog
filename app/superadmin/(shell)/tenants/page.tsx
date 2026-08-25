import type { Metadata } from "next";
import Link from "next/link";
import { listAllTenantsWithCounts } from "@/lib/repositories/superadmin-repository";
import { NSTenantsTable } from "@/components/superadmin/NSTenantsTable";
import { NSButton } from "@/components/ui/NSButton";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function SuperadminTenantsPage() {
  const tenants = await listAllTenantsWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tenants.length} catálogos en la plataforma.</p>
        </div>
        <Link href="/superadmin/tenants/nuevo">
          <NSButton>Nuevo cliente</NSButton>
        </Link>
      </div>

      <NSTenantsTable tenants={tenants} />
    </div>
  );
}
