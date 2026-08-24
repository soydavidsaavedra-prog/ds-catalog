"use client";

import Link from "next/link";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSQuantityStepper } from "@/components/ui/NSQuantityStepper";
import { formatPrice } from "@/lib/utils/format";
import { cartItemKey, type CartItem } from "@/lib/types/cart";
import { useCartStore } from "@/lib/cart/cart-store";

export function NSCartItemRow({ item, brandName }: { item: CartItem; brandName?: string }) {
  const key = cartItemKey(item);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 border-b border-border py-4">
      <Link href={`/producto/${item.slug}`} className="h-20 w-16 shrink-0 overflow-hidden rounded-control">
        <NSMedia src={item.image} alt={item.name} className="h-full w-full" sizes="80px" brandName={brandName} />
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/producto/${item.slug}`} className="text-sm font-semibold hover:text-accent-strong">
              {item.name}
            </Link>
            <p className="text-xs text-muted-foreground">{item.reference}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(key)}
            aria-label="Eliminar del carrito"
            className="text-muted-foreground transition-colors hover:text-danger"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path strokeLinecap="round" d="M4 5.5h12M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M6 5.5l.6 10.2a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-10.2" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Talla: {item.size} · Color: {item.color}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <NSQuantityStepper
            value={item.quantity}
            onChange={(qty) => updateQuantity(key, qty)}
            max={20}
            className="h-9 scale-90 origin-left"
          />
          <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
