import type { Metadata } from "next";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { NSParkingApkUploadForm } from "@/components/superadmin/NSParkingApkUploadForm";
import { formatBytes } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Estacionamiento (APK)",
};

export default async function SuperadminEstacionamientoPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide">Estacionamiento (APK)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          APK demo del sistema de gestión de estacionamientos de DS Studio, descargable desde la página pública{" "}
          <a href="/estacionamiento" target="_blank" rel="noopener noreferrer" className="underline">
            /estacionamiento
          </a>
          .
        </p>
      </div>

      <div className="max-w-lg rounded-card border border-border bg-surface-elevated p-6">
        <h2 className="font-display text-lg uppercase tracking-wide">APK actual</h2>
        {settings.apkUrl ? (
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground">{settings.apkFileName}</span>
            </p>
            {settings.apkSizeBytes != null ? <p>{formatBytes(settings.apkSizeBytes)}</p> : null}
            {settings.apkUploadedAt ? (
              <p>Subido el {new Date(settings.apkUploadedAt).toLocaleString("es")}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Aún no se ha subido ningún APK.</p>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {settings.apkUrl ? "Reemplazar APK" : "Subir APK"}
          </p>
          <NSParkingApkUploadForm />
        </div>
      </div>
    </div>
  );
}
