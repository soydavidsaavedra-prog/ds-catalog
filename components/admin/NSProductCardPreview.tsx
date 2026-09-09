"use client";

import { NSMedia } from "@/components/ui/NSMedia";
import { NSBadge } from "@/components/ui/NSBadge";
import { NSPrice } from "@/components/ui/NSPrice";
import { NSPaymentBadge } from "@/components/catalog/NSPaymentBadge";
import { CARD_ASPECT_RATIO_CLASSES } from "@/components/storefront/themes/theme-01/NSProductCard";
import type { CardAspectRatio, ImageFit } from "@/lib/types/catalog";

/**
 * A live, non-clickable render of exactly what NSProductCard shows in the
 * real catalog grid — same aspect-ratio classes, same badge placement —
 * so an admin picking a card shape / image fit (or just uploading a photo)
 * sees the actual result before saving, not just the raw uploader.
 */
export function NSProductCardPreview({
  imageSrc,
  name,
  reference,
  price,
  isNew,
  onSale,
  outOfStock,
  hidePaymentBadge,
  paymentBadge,
  cardAspectRatio,
  imageFit,
  brandName,
}: {
  imageSrc?: string;
  name: string;
  reference: string;
  price: number;
  isNew: boolean;
  onSale: boolean;
  outOfStock: boolean;
  hidePaymentBadge: boolean;
  paymentBadge?: { icon: string; label: string };
  cardAspectRatio: CardAspectRatio;
  imageFit: ImageFit;
  brandName?: string;
}) {
  const showPaymentBadge = !hidePaymentBadge && paymentBadge?.icon;

  return (
    <div className="flex flex-col">
      <div
        className={`relative overflow-hidden rounded-card bg-ink-900 ${CARD_ASPECT_RATIO_CLASSES[cardAspectRatio]}`}
      >
        <NSMedia
          src={imageSrc}
          alt={name || "Vista previa"}
          reference={reference}
          sizes="320px"
          objectFit={imageFit}
          brandName={brandName}
        />

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {isNew ? <NSBadge tone="gold">Nuevo</NSBadge> : null}
          {onSale ? <NSBadge tone="danger">Oferta</NSBadge> : null}
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
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <p className="truncate text-sm font-medium text-foreground">{name || "Nombre del producto"}</p>
        <p className="text-xs text-muted-foreground">{reference || "REF"}</p>
        <NSPrice amount={price} />
      </div>
    </div>
  );
}
