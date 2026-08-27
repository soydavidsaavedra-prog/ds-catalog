import type { Product } from "@/lib/types/catalog";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSProductGrid } from "./NSProductGrid";
import type { PaymentBadgeInfo } from "./NSProductCard";

export function NSRelatedProducts({
  tenantSlug,
  products,
  paymentBadge,
  brandName,
}: {
  tenantSlug: string;
  products: Product[];
  paymentBadge?: PaymentBadgeInfo;
  brandName?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NSSectionHeading eyebrow="Combina con" title="También te puede interesar" />
        <div className="mt-8">
          <NSProductGrid
            tenantSlug={tenantSlug}
            products={products}
            paymentBadge={paymentBadge}
            brandName={brandName}
          />
        </div>
      </div>
    </section>
  );
}
