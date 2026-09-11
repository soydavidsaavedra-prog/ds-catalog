"use server";

import { revalidatePath } from "next/cache";
import { getProductById, updateProduct } from "@/lib/repositories/product-repository";
import { createOrder, type OrderInput } from "@/lib/repositories/order-repository";
import { applyStockDecrement, deriveAvailabilityFromStock } from "@/lib/products/stock";

/**
 * Records the order (so the previously-always-empty /admin/pedidos list
 * finally has something to show — see that page's own copy) and, for every
 * item whose product tracks real stock (Product.stock !== null),
 * decrements it and recomputes its availability from the new count. Called
 * directly as a function from the cart drawer's checkout button, not via a
 * <form action>, so it can finish before the browser opens the WhatsApp
 * deep link that actually closes the sale.
 *
 * Best-effort on purpose: this is a bookkeeping side effect, not a payment
 * gate (this platform's whole model is manual payment verification over
 * WhatsApp — see README). A lookup/update failure for one item is logged
 * and skipped rather than thrown, and the order is still recorded with
 * whatever succeeded; the WhatsApp message must go out either way.
 */
export async function placeOrderAction(tenantId: string, tenantSlug: string, input: OrderInput): Promise<void> {
  for (const item of input.items) {
    try {
      const product = await getProductById(tenantId, item.productId);
      if (!product || product.stock === null) continue;
      const nextStock = applyStockDecrement(product.stock, item.quantity);
      await updateProduct(tenantId, item.productId, {
        stock: nextStock,
        availability: deriveAvailabilityFromStock(nextStock),
      });
      revalidatePath(`/${tenantSlug}/producto/${item.slug}`);
    } catch (err) {
      console.error(`[checkout] failed to decrement stock for ${item.productId}:`, err);
    }
  }

  try {
    await createOrder(tenantId, input);
  } catch (err) {
    console.error("[checkout] failed to record order:", err);
  }

  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/catalogo`);
  revalidatePath(`/${tenantSlug}/admin/productos`);
  revalidatePath(`/${tenantSlug}/admin/pedidos`);
}
