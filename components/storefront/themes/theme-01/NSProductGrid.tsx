import type { Product } from "@/lib/types/catalog";
import { NSProductCard, type PaymentBadgeInfo } from "./NSProductCard";
import { NSButton } from "@/components/ui/NSButton";
import { NSEmptyState } from "@/components/ui/NSEmptyState";

export function NSProductGrid({
  tenantSlug,
  products,
  emptyTitle = "No encontramos productos",
  emptyDescription = "Prueba ajustando los filtros o la búsqueda.",
  paymentBadge,
  brandName,
  currency,
}: {
  tenantSlug: string;
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  paymentBadge?: PaymentBadgeInfo;
  brandName?: string;
  currency?: string;
}) {
  if (products.length === 0) {
    return (
      <NSEmptyState
        className="py-24"
        title={emptyTitle}
        description={emptyDescription}
        action={
          <NSButton href={`/${tenantSlug}/catalogo`} variant="outline" size="sm">
            Ver todo el catálogo
          </NSButton>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <NSProductCard
          key={product.id}
          tenantSlug={tenantSlug}
          product={product}
          priority={index < 4}
          paymentBadge={paymentBadge}
          brandName={brandName}
          currency={currency}
        />
      ))}
    </div>
  );
}
