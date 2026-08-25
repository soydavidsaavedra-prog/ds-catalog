"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartItemKey, type CartItem } from "@/lib/types/cart";

/**
 * The storefront always renders under /[tenant]/..., so the first path
 * segment on first load is the tenant's slug — used to key cart
 * persistence per tenant (ds-cart-elnuevosanchez, ds-cart-demo, ...) so
 * two tenants' carts never mix in the same browser. Read once at module
 * load (SSR-safe: falls back to a neutral key on the server, where this
 * store is never actually persisted/read).
 */
function currentTenantSlug(): string {
  if (typeof window === "undefined") return "root";
  return window.location.pathname.split("/").filter(Boolean)[0] || "root";
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const key = cartItemKey(item);
          const existingIndex = state.items.findIndex((i) => cartItemKey(i) === key);

          if (existingIndex !== -1) {
            const items = [...state.items];
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: items[existingIndex].quantity + item.quantity,
            };
            return { items, isOpen: true };
          }

          return { items: [...state.items, item], isOpen: true };
        }),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => cartItemKey(i) !== key),
        })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => cartItemKey(i) !== key)
              : state.items.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: `ds-cart-${currentTenantSlug()}`,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function useCartCount(): number {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}

export function useCartTotal(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
}
