import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { NSFavoritesView } from "@/components/wishlist/NSFavoritesView";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false, follow: false },
};

export default async function FavoritosPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  await resolveTenant(tenantSlug);
  return <NSFavoritesView tenantSlug={tenantSlug} />;
}
