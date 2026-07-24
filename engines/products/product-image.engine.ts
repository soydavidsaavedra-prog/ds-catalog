import type { Product } from "@/types/product";
import type { ProductImage } from "@/types/product-image";

export const productImageEngine = {
  getPrimaryImage(product: Product): ProductImage | null {
    return product.images.length > 0
      ? product.images[0]
      : null;
  },
};