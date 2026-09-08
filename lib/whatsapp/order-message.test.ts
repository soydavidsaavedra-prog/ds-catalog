import { describe, expect, it } from "vitest";
import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from "@/lib/whatsapp/order-message";
import { absoluteUrl, formatPrice } from "@/lib/utils/format";
import type { CartItem } from "@/lib/types/cart";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    slug: "taladro-percutor",
    reference: "REF-1",
    name: "Taladro percutor",
    image: "/img.jpg",
    size: null,
    color: null,
    quantity: 1,
    price: 50,
    ...overrides,
  };
}

describe("buildWhatsAppOrderMessage", () => {
  it("includes product, reference, quantity, price and a direct product link per item", () => {
    const item = makeItem();
    const message = buildWhatsAppOrderMessage([item], "ferreteria-central");

    expect(message).toContain("Hola, quiero realizar el siguiente pedido:");
    expect(message).toContain(item.name);
    expect(message).toContain(item.reference);
    expect(message).toContain(String(item.quantity));
    expect(message).toContain(formatPrice(item.price));
    expect(message).toContain(absoluteUrl(`/ferreteria-central/producto/${item.slug}`));
  });

  it("omits TALLA/COLOR blocks entirely when the product has neither", () => {
    const message = buildWhatsAppOrderMessage([makeItem({ size: null, color: null })], "tenant");
    expect(message).not.toContain("TALLA:");
    expect(message).not.toContain("COLOR:");
  });

  it("includes TALLA/COLOR only for the fields that are actually set", () => {
    const sizeOnly = buildWhatsAppOrderMessage([makeItem({ size: "M", color: null })], "tenant");
    expect(sizeOnly).toContain("TALLA:");
    expect(sizeOnly).not.toContain("COLOR:");

    const colorOnly = buildWhatsAppOrderMessage([makeItem({ size: null, color: "Rojo" })], "tenant");
    expect(colorOnly).not.toContain("TALLA:");
    expect(colorOnly).toContain("COLOR:");
  });

  it("sums price * quantity across every line for the total", () => {
    const items = [makeItem({ price: 50, quantity: 2 }), makeItem({ productId: "p2", price: 30, quantity: 1 })];
    const message = buildWhatsAppOrderMessage(items, "tenant");
    const expectedTotal = 50 * 2 + 30 * 1;
    expect(message.trim().endsWith(`TOTAL:\n${formatPrice(expectedTotal)}`)).toBe(true);
  });

  it("separates each product block with the same delimiter", () => {
    const items = [makeItem({ productId: "p1" }), makeItem({ productId: "p2", name: "Otro producto" })];
    const message = buildWhatsAppOrderMessage(items, "tenant");
    expect(message.split("\n\n----------\n\n").length).toBe(items.length + 2);
  });
});

describe("buildWhatsAppOrderUrl", () => {
  it("builds a wa.me link with the number and URL-encoded message", () => {
    const items = [makeItem()];
    const url = buildWhatsAppOrderUrl(items, "584121234567", "tenant");
    expect(url.startsWith("https://wa.me/584121234567?text=")).toBe(true);
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toBe(buildWhatsAppOrderMessage(items, "tenant"));
  });
});
