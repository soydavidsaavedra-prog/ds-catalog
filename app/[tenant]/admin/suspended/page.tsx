import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { getFreezeReason, type FreezeReason } from "@/lib/tenant/plan-limits";
import { getSettings } from "@/lib/repositories/settings-repository";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { NSLogo } from "@/components/brand/NSLogo";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";
import { logoutAction } from "@/app/[tenant]/admin/actions";

export const metadata: Metadata = {
  title: "Cuenta suspendida",
  robots: { index: false, follow: false },
};

const COPY: Record<FreezeReason, { title: string; body: string }> = {
  pending: {
    title: "Cuenta en revisión",
    body: "Recibimos tu registro y el plan que elegiste. En breve confirmamos tu cuenta y podrás entrar a tu panel — te avisaremos por correo.",
  },
  expired: {
    title: "Tu plan venció",
    body: "Tu catálogo público y tu panel quedaron en pausa hasta que se renueve. Contáctanos para reactivarlo.",
  },
  cancelled: {
    title: "Suscripción cancelada",
    body: "Tu catálogo público y tu panel quedaron en pausa. Contáctanos si quieres reactivar tu cuenta.",
  },
};

export default async function AdminSuspendedPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  if (!(await isAdminAuthenticated(tenantSlug))) {
    redirect("/acceder");
  }
  // Redirect back to the normal panel the moment it's no longer frozen —
  // this page isn't where a healthy account should land.
  const reason = await getFreezeReason(tenant.id);
  if (!reason) {
    redirect(`/${tenantSlug}/admin`);
  }
  const [settings, platformSettings] = await Promise.all([getSettings(tenant.id), getPlatformSettings()]);
  const copy = COPY[reason];

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-4 text-center text-ink-0">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <NSLogo
            id="ns-suspended"
            variant="mark"
            className="h-14 w-14"
            src={settings.brandLogo}
            brandName={settings.brandName}
            tagline={settings.heroSubtitle}
          />
        </div>
        <div className="rounded-card border border-warning/30 bg-warning/10 p-6">
          <p className="font-display text-lg uppercase tracking-wide text-warning">{copy.title}</p>
          <p className="mt-2 text-sm text-ink-300">{copy.body}</p>
        </div>
        {platformSettings.supportWhatsappNumber ? (
          <NSWhatsAppButton
            whatsappNumber={platformSettings.supportWhatsappNumber}
            message={`Hola, necesito ayuda con mi cuenta de DS Catalog (${tenantSlug}).`}
            className="mt-4"
          >
            Contactar soporte
          </NSWhatsAppButton>
        ) : null}
        <form action={logoutAction} className="mt-6">
          <button type="submit" className="text-xs font-medium text-ink-400 hover:text-ink-0">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
