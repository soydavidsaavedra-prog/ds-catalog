import { NSNotFound } from "@/components/ui/NSNotFound";

export default async function StorefrontNotFound({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  return <NSNotFound tenantSlug={tenant} />;
}
