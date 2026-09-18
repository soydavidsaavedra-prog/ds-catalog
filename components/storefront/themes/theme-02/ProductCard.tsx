"use client";

import Link from "next/link";
import type { CardAspectRatio, PaymentBadgeInfo, Product } from "@/lib/types/catalog";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSBadge } from "@/components/ui/NSBadge";
import { NSPrice } from "@/components/ui/NSPrice";
import { NSPaymentBadge } from "@/components/catalog/NSPaymentBadge";
import { useCartStore } from "@/lib/cart/cart-store";
import { useQuickViewStore } from "@/lib/quickview/quickview-store";
import { useWishlistStore, wishlistItemFromProduct } from "@/lib/wishlist/wishlist-store";

export const CARD_ASPECT_RATIO_CLASSES: Record<CardAspectRatio, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
};

export type { PaymentBadgeInfo };

/**
 * Theme 02's product card — image-led, commercial, with the quick-add cart
 * affordance sitting inline next to the price (not a hover-only overlay),
 * matching the reference's card layout. No star ratings/review counts: DS
 * Catalog has no review system, so nothing fake is shown in its place.
 */
export function ProductCard({
  tenantSlug,
  product,
  priority = false,
  paymentBadge,
  brandName,
  currency,
}: {
  tenantSlug: string;
  product: Product;
  priority?: boolean;
  paymentBadge?: PaymentBadgeInfo;
  brandName?: string;
  currency?: string;
}) {
  const outOfStock = product.availability === "out_of_stock";
  const showPaymentBadge = !product.hidePaymentBadge && paymentBadge?.icon;
  const hasVariants = product.sizes.length > 0 || product.colors.length > 0;
  const addItem = useCartStore((s) => s.addItem);
  const openQuickView = useQuickViewStore((s) => s.open);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    openQuickView({ product, tenantSlug, brandName, paymentBadge, currency });
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (hasVariants) {
      openQuickView({ product, tenantSlug, brandName, paymentBadge, currency });
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      reference: product.reference,
      name: product.name,
      image: product.images[0],
      size: null,
      color: null,
      quantity: 1,
      price: product.price,
    });
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(wishlistItemFromProduct(product));
  }

  return (
    <Link
      href={`/${tenantSlug}/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong"
    >
      <div className={`relative overflow-hidden bg-background ${CARD_ASPECT_RATIO_CLASSES[product.cardAspectRatio]}`}>
        <div className="h-full w-full transition-transform duration-slower ease-out-ns group-hover:scale-105">
          <NSMedia
            src={product.images[0]}
            alt={product.name}
            reference={product.reference}
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            priority={priority}
            objectFit={product.imageFit}
            brandName={brandName}
          />
        </div>

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.isNew ? <NSBadge tone="gold">Nuevo</NSBadge> : null}
          {product.onSale ? <NSBadge tone="danger">Oferta</NSBadge> : null}
        </div>

        {showPaymentBadge ? (
          <div className="absolute right-2.5 top-2.5">
            <NSPaymentBadge icon={paymentBadge!.icon} label={paymentBadge!.label} />
          </div>
        ) : null}

        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <NSBadge tone="outline">Agotado</NSBadge>
          </div>
        ) : null}

        <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-2 opacity-100 transition-opacity duration-normal sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={isWishlisted}
            className="flex h-9 w-9 items-center justify-center rounded-control bg-background/90 text-foreground shadow-card"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 16.8s-6-3.7-8-7.5A4.3 4.3 0 0 1 10 5.3a4.3 4.3 0 0 1 8 3.9c-2 3.9-8 7.5-8 7.5Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            aria-label="Vista rápida"
            className="flex h-9 w-9 items-center justify-center rounded-control bg-background/90 text-foreground shadow-card"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10s2.8-5 8-5 8 5 8 5-2.8 5-8 5-8-5-8-5Z" />
              <circle cx="10" cy="10" r="2.2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.reference}</p>
        <span className="mt-0.5 inline-flex w-fit items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span
            className={`h-1.5 w-1.5 rounded-full ${outOfStock ? "bg-danger" : product.availability === "low_stock" ? "bg-warning" : "bg-success"}`}
            aria-hidden
          />
          {outOfStock ? "Agotado" : product.availability === "low_stock" ? "Pocas unidades" : "Disponible"}
        </span>
        <div className="mt-auto flex items-end justify-between pt-1.5">
          <NSPrice amount={product.price} compareAt={product.previousPrice} currency={currency} className="text-accent-strong" />
          {!outOfStock ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={hasVariants ? "Elegir opciones" : "Agregar al carrito"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent text-accent-foreground transition-transform duration-normal hover:scale-105"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h1.2l.4 2M6 12h8l2.4-6H5M6 12l-1.2-6M6 12l-1 3.5h10M8 18a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Zm6.5 0a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
