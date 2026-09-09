import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedSuperadmin } from "@/lib/auth/superadmin-auth";
import { listTotpFactors } from "@/lib/auth/supabase-auth";
import { countUnusedBackupCodes } from "@/lib/auth/totp-backup-codes";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { NSTotpSettings } from "@/components/superadmin/NSTotpSettings";

export const metadata: Metadata = {
  title: "Seguridad",
};

export default async function SuperadminSeguridadPage() {
  const superadmin = await getAuthenticatedSuperadmin();
  if (!superadmin) redirect("/acceder");

  const factors = await listTotpFactors(superadmin.id);
  const enabled = factors.some((f) => f.verified);
  const unusedBackupCodes = enabled ? await countUnusedBackupCodes(superadmin.id) : 0;

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <DSPageHeader
        title="Seguridad"
        description="Verificación en dos pasos para tu propia cuenta de Super Admin — el compromiso de esta única cuenta afecta a todos los clientes de la plataforma."
      />
      <NSTotpSettings enabled={enabled} unusedBackupCodes={unusedBackupCodes} />
    </div>
  );
}
