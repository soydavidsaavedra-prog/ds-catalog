import type { CartItem } from "@/lib/types/cart";
import { absoluteUrl, formatPrice } from "@/lib/utils/format";

/**
 * WhatsApp Engine — turns the cart into the exact templated order message
 * the seller receives, including a direct product link per line so they
 * can open each item and confirm it before replying.
 */
export function buildWhatsAppOrderMessage(items: CartItem[], tenantSlug: string): string {
  const header = "Hola, quiero realizar el siguiente pedido:";

  const blocks = items.map((item) => {
    const lines = [
      "PRODUCTO:",
      item.name,
      "",
      "REFERENCIA:",
      item.reference,
      "",
      ...(item.size ? ["TALLA:", item.size, ""] : []),
      ...(item.color ? ["COLOR:", item.color, ""] : []),
      "CANTIDAD:",
      String(item.quantity),
      "",
      "PRECIO:",
      formatPrice(item.price),
      "",
      "LINK:",
      absoluteUrl(`/${tenantSlug}/producto/${item.slug}`),
    ];
    return lines.join("\n");
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const footer = `TOTAL:\n${formatPrice(total)}`;

  return [header, ...blocks, footer].join("\n\n----------\n\n");
}

export function buildWhatsAppOrderUrl(items: CartItem[], whatsappNumber: string, tenantSlug: string): string {
  const message = buildWhatsAppOrderMessage(items, tenantSlug);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
