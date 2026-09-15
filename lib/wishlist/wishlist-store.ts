"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/lib/types/catalog";

/** Same per-tenant keying strategy as lib/cart/cart-store.ts — see its comment for why. */
function currentTenantSlug(): string {
  if (typeof window === "undefined") return "root";
  return window.location.pathname.split("/").filter(Boolean)[0] || "root";
}

/** A small snapshot of the product, enough to render a card on /favoritos without refetching — mirrors CartItem's own approach. */
export interface WishlistItem {
  productId: string;
  slug: string;
  reference: string;
  name: string;
  image: string;
  price: number;
  previousPrice: number | null;
  cardAspectRatio: Product["cardAspectRatio"];
  imageFit: Product["imageFit"];
  availability: Product["availability"];
  colors: Product["colors"];
  isNew: boolean;
  onSale: boolean;
  hidePaymentBadge: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),

      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      has: (productId) => get().items.some((i) => i.productId === productId),
    }),
    {
      name: `ds-wishlist-${currentTenantSlug()}`,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useWishlistCount(): number {
  return useWishlistStore((state) => state.items.length);
}

export function wishlistItemFromProduct(product: Product): WishlistItem {
  return {
    productId: product.id,
    slug: product.slug,
    reference: product.reference,
    name: product.name,
    image: product.images[0],
    price: product.price,
    previousPrice: product.previousPrice,
    cardAspectRatio: product.cardAspectRatio,
    imageFit: product.imageFit,
    availability: product.availability,
    colors: product.colors,
    isNew: product.isNew,
    onSale: product.onSale,
    hidePaymentBadge: product.hidePaymentBadge,
  };
}
