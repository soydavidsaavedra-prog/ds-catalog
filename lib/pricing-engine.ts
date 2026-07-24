import type { Product } from "@/types/product";

export function getCurrentPrice(
  product: Product
) {
  return product.price;
}

export function hasDiscount(
  product: Product
) {
  return (
    product.compareAtPrice >
    product.price
  );
}

export function getDiscountAmount(
  product: Product
) {
  if (!hasDiscount(product))
    return 0;

  return (
    product.compareAtPrice -
    product.price
  );
}

export function getDiscountPercentage(
  product: Product
) {
  if (!hasDiscount(product))
    return 0;

  return Math.round(
    (getDiscountAmount(product) /
      product.compareAtPrice) *
      100
  );
}

export function getSavingsLabel(
  product: Product
) {
  const percent =
    getDiscountPercentage(product);

  if (percent <= 0)
    return "";

  return `Ahorras ${percent}%`;
}

export function isOnSale(
  product: Product
) {
  return hasDiscount(product);
}