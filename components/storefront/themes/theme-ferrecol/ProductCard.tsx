import Link from "next/link";
import type { CardAspectRatio, PaymentBadgeInfo, Product } from "@/lib/types/catalog";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSBadge } from "@/components/ui/NSBadge";
import { NSPrice } from "@/components/ui/NSPrice";
import { NSPaymentBadge } from "@/components/catalog/NSPaymentBadge";

export const CARD_ASPECT_RATIO_CLASSES: Record<CardAspectRatio, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
};

export type { PaymentBadgeInfo };

/**
 * Theme Ferrecol's product card — image-led, commercial, with a quick-add
 * cart action surfaced on hover (desktop) or always-visible (mobile),
 * matching the boutique-hardware reference. No star ratings/review counts:
 * DS Catalog has no review system, so nothing fake is shown in its place.
 */
export function ProductCard({
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
        ) : (
          <span
            aria-hidden
            className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-pill bg-accent text-accent-foreground opacity-0 shadow-card transition-opacity duration-normal group-hover:opacity-100 sm:opacity-0"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h1.2l.4 2M6 12h8l2.4-6H5M6 12l-1.2-6M6 12l-1 3.5h10M8 18a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Zm6.5 0a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.reference}</p>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <NSPrice amount={product.price} className="text-accent-strong" />
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${outOfStock ? "bg-danger" : product.availability === "low_stock" ? "bg-warning" : "bg-success"}`}
              aria-hidden
            />
            {outOfStock ? "Agotado" : product.availability === "low_stock" ? "Pocas unidades" : "Disponible"}
          </span>
        </div>
      </div>
    </Link>
  );
}
