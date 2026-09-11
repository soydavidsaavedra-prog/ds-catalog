import { NewProductPanel } from "../_new-product-panel";

export default async function AdminNewProductPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  return <NewProductPanel tenantSlug={tenantSlug} />;
}
