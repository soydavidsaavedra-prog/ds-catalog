import type { Metadata } from "next";
import { NSCreateTenantForm } from "@/components/superadmin/NSCreateTenantForm";

export const metadata: Metadata = {
  title: "Nuevo cliente",
};

export default function SuperadminNewTenantPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Nuevo cliente</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea el tenant, su contraseña de acceso y su configuración inicial. El resto (productos, tema, banners)
          lo administra el propio cliente desde su panel.
        </p>
      </div>
      <NSCreateTenantForm />
    </div>
  );
}
