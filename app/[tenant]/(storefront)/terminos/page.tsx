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
  return { title: "Términos y condiciones", alternates: { canonical: `/${tenantSlug}/terminos` } };
}

export default async function TenantTermsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const settings = await getSettings(tenant.id);

  if (!settings.termsContent.trim()) notFound();

  return <DSLegalContent title="Términos y condiciones" content={settings.termsContent} />;
}
