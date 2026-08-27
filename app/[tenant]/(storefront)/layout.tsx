import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { isSubscriptionFrozen } from "@/lib/tenant/plan-limits";
import { resolveTheme } from "@/lib/themes/registry";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";
import { buildAccentOverrideVars } from "@/lib/utils/brand";

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
  const theme = resolveTheme(tenant.theme);

  return (
    // `tenant.theme` doubles as the CSS scope class (see .theme-ferrecol in
    // app/globals.css) — a Theme with no scope rule of its own (e.g.
    // "theme-01", which IS the :root default) simply matches nothing, so
    // this is a no-op for it. bg-background/text-foreground here (not just
    // on <body>, which this div sits inside but doesn't override) is what
    // makes an overridden Theme's tokens actually paint across the whole
    // page, not just the sections that happen to set their own background
    // class. The tenant's own accentColor (buildAccentOverrideVars) is
    // applied as an INLINE style on this same element, so it always wins
    // over the Theme's own default accent — a class-based CSS declaration
    // can never out-rank an inline style on the same element, whichever
    // one a browser would otherwise consider "more specific."
    <div
      className={`${tenant.theme} flex min-h-dvh flex-col bg-background text-foreground`}
      style={buildAccentOverrideVars(settings)}
    >
      <theme.Header tenantSlug={tenant.slug} />
      <main className="flex-1">{children}</main>
      <theme.Footer tenantSlug={tenant.slug} />
      <theme.CartDrawer tenantSlug={tenant.slug} whatsappNumber={settings.whatsappNumber} brandName={settings.brandName} />
      <NSWhatsAppButton whatsappNumber={settings.whatsappNumber} variant="floating" />
    </div>
  );
}
