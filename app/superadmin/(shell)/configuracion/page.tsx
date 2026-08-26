import type { Metadata } from "next";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { NSPlatformSettingsForm } from "@/components/superadmin/NSPlatformSettingsForm";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function SuperadminConfiguracionPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ajustes globales de la plataforma.</p>
      </div>

      <div className="max-w-lg rounded-card border border-border bg-surface-elevated p-6">
        <h2 className="font-display text-lg uppercase tracking-wide">WhatsApp de soporte</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El número que ven tus clientes para contactarte: en la landing pública, en su panel administrativo y en su
          página de cuenta suspendida/pendiente. Distinto del WhatsApp propio de cada catálogo (ese lo configura cada
          cliente para recibir sus propios pedidos).
        </p>
        <NSPlatformSettingsForm settings={settings} />
      </div>
    </div>
  );
}
