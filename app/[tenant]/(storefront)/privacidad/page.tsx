import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { DSLegalContent } from "@/components/ui/DSLegalContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  return { title: "Política de privacidad", alternates: { canonical: `/${tenantSlug}/privacidad` } };
}

export default async function TenantPrivacyPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const settings = await getSettings(tenant.id);

  if (!settings.privacyContent.trim()) notFound();

  return <DSLegalContent title="Política de privacidad" content={settings.privacyContent} />;
}
