import type { PaymentBadgeInfo, Product } from "@/lib/types/catalog";
import { NSButton } from "@/components/ui/NSButton";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  tenantSlug,
  products,
  emptyTitle = "No encontramos productos",
  emptyDescription = "Prueba ajustando los filtros o la búsqueda.",
  paymentBadge,
  brandName,
}: {
  tenantSlug: string;
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  paymentBadge?: PaymentBadgeInfo;
  brandName?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border py-24 text-center">
        <p className="text-xl font-semibold text-foreground">{emptyTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        <NSButton href={`/${tenantSlug}/catalogo`} variant="outline" size="sm">
          Ver todo el catálogo
        </NSButton>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          tenantSlug={tenantSlug}
          product={product}
          priority={index < 4}
          paymentBadge={paymentBadge}
          brandName={brandName}
        />
      ))}
    </div>
  );
}
