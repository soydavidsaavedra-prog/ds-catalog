"use client";

import { useRef } from "react";
import type { PaymentBadgeInfo, Product } from "@/lib/types/catalog";
import { NSButton } from "@/components/ui/NSButton";
import { ProductCard } from "./ProductCard";

export function ProductCarousel({
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
  const scrollerRef = useRef<HTMLDivElement>(null);

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

  function scroll(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]">
            <ProductCard
              tenantSlug={tenantSlug}
              product={product}
              priority={index < 4}
              paymentBadge={paymentBadge}
              brandName={brandName}
            />
          </div>
        ))}
      </div>

      {products.length > 4 ? (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-border/40"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5 7 10l5.5 5.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-border/40"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 4.5 5.5 5.5-5.5 5.5" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
