"use client";

import { useCartCount, useCartStore } from "@/lib/cart/cart-store";
import { cn } from "@/lib/utils/cn";

export function NSCartButton({ className }: { className?: string }) {
  const count = useCartCount();
  const toggleCart = useCartStore((s) => s.toggleCart);

  return (
    <button
      type="button"
      onClick={toggleCart}
      aria-label={`Carrito, ${count} artículos`}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-control text-foreground transition-colors hover:bg-surface",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l.4 2M7 13h10l3-7H6.4M7 13L5.4 6M7 13l-1.5 5h12M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}
