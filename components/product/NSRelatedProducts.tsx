import type { Product } from "@/lib/types/catalog";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSProductGrid } from "@/components/catalog/NSProductGrid";

export function NSRelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NSSectionHeading eyebrow="Combina con" title="También te puede interesar" />
        <div className="mt-8">
          <NSProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
