import type { Product } from "@/types/product";
import type { ProductImage } from "@/types/product-image";
import { getPublicUrl } from "@/lib/supabase-storage";

type SupabaseProduct = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  short_description: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  compare_at_price: number;
  currency: string;
  stock: number;
  active: boolean;
  featured: boolean;
  tags: string[];
  images: (string | ProductImage)[];
  variants: Product["variants"];
};

function normalizeImage(image: string | ProductImage): ProductImage {
  const value = typeof image === "string" ? image : image.path;
  const alt = typeof image === "string" ? "" : image.alt ?? "";

  // URL absoluta
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return {
      path: value,
      alt,
    };
  }

  // Imagen local del proyecto
  if (value.startsWith("/")) {
    return {
      path: value,
      alt,
    };
  }

  // Ruta almacenada en Supabase Storage
  return {
    path: getPublicUrl("products", value),
    alt,
  };
}

export function mapProduct(product: SupabaseProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    shortDescription: product.short_description,
    description: product.description,
    brand: product.brand,
    category: product.category,
    price: Number(product.price),
    compareAtPrice: Number(product.compare_at_price),
    currency: product.currency,
    stock: product.stock,
    active: product.active,
    featured: product.featured,
    tags: product.tags ?? [],
    images: (product.images ?? []).map(normalizeImage),
    variants: product.variants ?? [],
  };
}
