import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { NSHeader } from "@/components/layout/NSHeader";
import { NSFooter } from "@/components/layout/NSFooter";
import { NSCartDrawer } from "@/components/cart/NSCartDrawer";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const settings = await getSettings(tenant.id);

  return (
    <>
      <NSHeader tenantSlug={tenant.slug} />
      <main className="flex-1">{children}</main>
      <NSFooter tenantSlug={tenant.slug} />
      <NSCartDrawer tenantSlug={tenant.slug} whatsappNumber={settings.whatsappNumber} />
      <NSWhatsAppButton whatsappNumber={settings.whatsappNumber} variant="floating" />
    </>
  );
}
