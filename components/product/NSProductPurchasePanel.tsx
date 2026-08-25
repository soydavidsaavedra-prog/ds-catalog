"use client";

import { useState } from "react";
import type { Product } from "@/lib/types/catalog";
import { NSPrice } from "@/components/ui/NSPrice";
import { NSAvailabilityBadge } from "@/components/ui/NSAvailabilityBadge";
import { NSQuantityStepper } from "@/components/ui/NSQuantityStepper";
import { NSButton } from "@/components/ui/NSButton";
import { useCartStore } from "@/lib/cart/cart-store";
import { absoluteUrl } from "@/lib/utils/format";
import { shareProduct } from "@/lib/utils/share";
import { cn } from "@/lib/utils/cn";
import { NSPaymentBadge } from "@/components/catalog/NSPaymentBadge";
import type { PaymentBadgeInfo } from "@/components/catalog/NSProductCard";

export function NSProductPurchasePanel({
  tenantSlug,
  product,
  paymentBadge,
}: {
  tenantSlug: string;
  product: Product;
  paymentBadge?: PaymentBadgeInfo;
}) {
  const showPaymentBadge = !product.hidePaymentBadge && paymentBadge?.icon;
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const addItem = useCartStore((s) => s.addItem);

  const outOfStock = product.availability === "out_of_stock";
  const canAdd = !outOfStock && (product.sizes.length === 0 || size) && (product.colors.length === 0 || color);

  const handleAddToCart = () => {
    if (!canAdd) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      reference: product.reference,
      name: product.name,
      image: product.images[0],
      size: size || "Única",
      color: color || "Único",
      quantity,
      price: product.price,
    });
    setQuantity(1);
  };

  const handleShare = async () => {
    const result = await shareProduct({
      title: product.name,
      text: `${product.name} — ${product.reference}`,
      url: absoluteUrl(`/${tenantSlug}/producto/${product.slug}`),
    });
    if (result === "copied") {
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {product.reference}
        </p>
        <h1 className="mt-1 font-display text-3xl uppercase tracking-wide sm:text-4xl">{product.name}</h1>
        <div className="mt-3 flex items-center gap-4">
          <NSPrice amount={product.price} size="lg" />
          <NSAvailabilityBadge availability={product.availability} />
        </div>
        {showPaymentBadge ? (
          <div className="mt-3 flex items-center gap-2">
            <NSPaymentBadge icon={paymentBadge!.icon} label={paymentBadge!.label} size="md" />
            <span className="text-xs font-medium text-muted-foreground">{paymentBadge!.label}</span>
          </div>
        ) : null}
      </div>

      <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{product.description}</p>

      {product.sizes.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Talla</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={cn(
                  "flex h-11 min-w-11 items-center justify-center rounded-control border px-3 text-sm font-semibold transition-colors",
                  size === s
                    ? "border-accent-strong bg-accent text-accent-foreground"
                    : "border-border-strong text-foreground hover:border-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {product.colors.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</p>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-pressed={color === c.name}
                aria-label={c.name}
                title={c.name}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                  color === c.name ? "border-accent-strong" : "border-transparent hover:border-border-strong",
                )}
              >
                <span className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cantidad</p>
        <NSQuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <NSButton
          onClick={handleAddToCart}
          disabled={!canAdd}
          size="lg"
          className="flex-1"
          icon={<CartIcon />}
        >
          {outOfStock ? "Agotado" : "Agregar al carrito"}
        </NSButton>
        <button
          type="button"
          onClick={handleShare}
          className="flex h-14 items-center justify-center gap-2 rounded-control border border-border-strong px-6 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-foreground"
        >
          <ShareIcon />
          {shareState === "copied" ? "Enlace copiado" : "Compartir producto"}
        </button>
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h1.2l.4 2M6 12h8l2.4-6H5M6 12l-1.2-6M6 12l-1 3.5h10M8 18a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Zm6.5 0a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="15" cy="5" r="2" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="15" cy="15" r="2" />
      <path strokeLinecap="round" d="m7 9 6-3M7 11l6 3" />
    </svg>
  );
}
