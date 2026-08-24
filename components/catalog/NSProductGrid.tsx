import type { Product } from "@/lib/types/catalog";
import { NSProductCard, type PaymentBadgeInfo } from "@/components/catalog/NSProductCard";
import { NSButton } from "@/components/ui/NSButton";

export function NSProductGrid({
  tenantSlug,
  products,
  emptyTitle = "No encontramos productos",
  emptyDescription = "Prueba ajustando los filtros o la búsqueda.",
  paymentBadge,
}: {
  tenantSlug: string;
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  paymentBadge?: PaymentBadgeInfo;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border py-24 text-center">
        <p className="font-display text-2xl uppercase tracking-wide">{emptyTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        <NSButton href={`/${tenantSlug}/catalogo`} variant="outline" size="sm">
          Ver todo el catálogo
        </NSButton>
      </div>
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
        />
      ))}
    </div>
  );
}
