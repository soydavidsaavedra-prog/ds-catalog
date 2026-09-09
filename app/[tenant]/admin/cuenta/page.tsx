import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getAppUserByTenantId } from "@/lib/repositories/app-users-repository";
import { getSubscriptionByTenantId } from "@/lib/repositories/subscriptions-repository";
import { listPlans } from "@/lib/repositories/plans-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { listOrders } from "@/lib/repositories/order-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { absoluteUrl } from "@/lib/utils/format";
import { NSAccountCenter } from "@/components/admin/NSAccountCenter";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function AdminAccountPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  const [appUser, subscription, plans, products, orders, settings] = await Promise.all([
    getAppUserByTenantId(tenant.id),
    getSubscriptionByTenantId(tenant.id),
    listPlans(),
    listProducts(tenant.id),
    listOrders(tenant.id),
    getSettings(tenant.id),
  ]);

  return (
    <NSAccountCenter
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      tenantName={tenant.name}
      tenantStatus={tenant.status}
      deletionRequestedAt={tenant.deletionRequestedAt}
      appUser={appUser}
      subscription={subscription}
      plans={plans}
      productsUsed={products.length}
      products={products}
      orders={orders}
      brandName={settings.brandName}
      catalogPreviewImage={settings.heroImage}
      publicUrl={absoluteUrl(`/${tenantSlug}`)}
    />
  );
}
