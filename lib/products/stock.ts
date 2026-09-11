import type { Availability } from "@/lib/types/catalog";

/**
 * Real inventory tracking, opt-in per product (see Product.stock in
 * lib/types/catalog.ts). A product with `stock: null` keeps the original
 * behavior — the tenant sets `availability` by hand from a fixed list
 * (Disponible/Pocas unidades/Agotado). A product with a `stock` number
 * instead has `availability` computed FROM that number, and an order
 * placed through the storefront decrements it (see placeOrderAction in
 * app/[tenant]/(storefront)/checkout-actions.ts) — so a tenant who wants a
 * real running count doesn't have to also remember to flip Disponible/
 * Agotado by hand on every sale.
 */

/** At or below this (but still > 0), a tracked product reads as "Pocas unidades" instead of "Disponible". */
export const LOW_STOCK_THRESHOLD = 3;

export function deriveAvailabilityFromStock(stock: number): Availability {
  if (stock <= 0) return "out_of_stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

/** Never goes negative — an order for more units than are left just takes what's there. */
export function applyStockDecrement(stock: number, quantity: number): number {
  return Math.max(0, stock - quantity);
}
