"use client";

import { useCartStore } from "@/lib/cart/cart-store";
import { NSToast } from "@/components/ui/NSToast";

/** Single global toast for every "added to cart" entry point (product detail, quick-view, quick-add from a card) — see cart-store's lastAddedName/addedTrigger. Mounted once in the storefront layout. */
export function NSCartAddedToast() {
  const name = useCartStore((s) => s.lastAddedName);
  const trigger = useCartStore((s) => s.addedTrigger);

  if (!name) return null;
  return <NSToast message={`${name} agregado al carrito`} trigger={trigger} />;
}
