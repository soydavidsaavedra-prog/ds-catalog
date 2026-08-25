import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { isSubscriptionFrozen } from "@/lib/tenant/plan-limits";
import { NSHeader } from "@/components/layout/NSHeader";
import { NSFooter } from "@/components/layout/NSFooter";
import { NSCartDrawer } from "@/components/cart/NSCartDrawer";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";
import { buildAccentOverrideCss } from "@/lib/utils/brand";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  // Independent of tenant.status (already enforced inside resolveTenant) —
  // this is the second, automatic way a catalog goes dark: its assigned
  // subscription ran out. See lib/tenant/plan-limits.ts.
  if (await isSubscriptionFrozen(tenant.id)) notFound();
  const settings = await getSettings(tenant.id);
  const accentOverrideCss = buildAccentOverrideCss(settings);

  return (
    <>
      {accentOverrideCss ? <style>{accentOverrideCss}</style> : null}
      <NSHeader tenantSlug={tenant.slug} />
      <main className="flex-1">{children}</main>
      <NSFooter tenantSlug={tenant.slug} />
      <NSCartDrawer tenantSlug={tenant.slug} whatsappNumber={settings.whatsappNumber} brandName={settings.brandName} />
      <NSWhatsAppButton whatsappNumber={settings.whatsappNumber} variant="floating" />
    </>
  );
}
