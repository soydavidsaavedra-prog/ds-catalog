export interface CartItem {
  productId: string;
  slug: string;
  reference: string;
  name: string;
  image: string;
  /** null when the product has no sizes/colors to choose from — not every business sells apparel. */
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
}

/** Uniquely identifies a cart line — same product with a different size/color is a separate line. */
export function cartItemKey(item: Pick<CartItem, "productId" | "size" | "color">): string {
  return `${item.productId}__${item.size}__${item.color}`;
}
