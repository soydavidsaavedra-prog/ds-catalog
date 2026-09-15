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

/** Shared with NSProductCardPreview (the admin's live preview) so both stay pixel-identical. */
export const CARD_ASPECT_RATIO_CLASSES: Record<CardAspectRatio, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
};

export type { PaymentBadgeInfo };

export function NSProductCard({
  tenantSlug,
  product,
  priority = false,
  paymentBadge,
  brandName,
}: {
  tenantSlug: string;
  product: Product;
  priority?: boolean;
  paymentBadge?: PaymentBadgeInfo;
  brandName?: string;
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
    openQuickView({ product, tenantSlug, brandName, paymentBadge });
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (hasVariants) {
      openQuickView({ product, tenantSlug, brandName, paymentBadge });
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
      className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong"
    >
      <div
        className={`relative overflow-hidden rounded-card bg-ink-900 ${CARD_ASPECT_RATIO_CLASSES[product.cardAspectRatio]}`}
      >
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
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
            <NSBadge tone="outline" className="border-ink-0 text-ink-0">
              Agotado
            </NSBadge>
          </div>
        ) : null}

        <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-2 opacity-100 transition-opacity duration-normal sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={isWishlisted}
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-ink-950/85 text-ink-0 shadow-card"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 16.8s-6-3.7-8-7.5A4.3 4.3 0 0 1 10 5.3a4.3 4.3 0 0 1 8 3.9c-2 3.9-8 7.5-8 7.5Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            aria-label="Vista rápida"
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-ink-950/85 text-ink-0 shadow-card"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10s2.8-5 8-5 8 5 8 5-2.8 5-8 5-8-5-8-5Z" />
              <circle cx="10" cy="10" r="2.2" />
            </svg>
          </button>
          {!outOfStock ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={hasVariants ? "Elegir opciones" : "Agregar al carrito"}
              className="flex h-9 w-9 items-center justify-center rounded-pill bg-ink-950/85 text-ink-0 shadow-card"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h1.2l.4 2M6 12h8l2.4-6H5M6 12l-1.2-6M6 12l-1 3.5h10M8 18a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Zm6.5 0a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.reference}</p>
        <div className="mt-0.5 flex items-center justify-between">
          <NSPrice amount={product.price} compareAt={product.previousPrice} />
          {product.colors.length > 0 ? (
            <div className="flex items-center gap-1" aria-hidden>
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  className="h-3 w-3 rounded-full border border-border-strong"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
