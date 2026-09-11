import { NewProductPanel } from "../../_new-product-panel";

/**
 * Intercepts an in-app click on "+ Nuevo producto" from /productos so the
 * list underneath (the sibling `children` slot in layout.tsx) stays
 * mounted and interactive instead of being navigated away from — a hard
 * refresh or direct link to this same URL instead hits the plain
 * ../nuevo/page.tsx route, which renders the same panel standalone.
 */
export default async function InterceptedNewProductModal({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  return <NewProductPanel tenantSlug={tenantSlug} />;
}
