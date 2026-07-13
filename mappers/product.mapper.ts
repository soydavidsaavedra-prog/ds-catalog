import type { Product } from "@/types/product";

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
  images: string[];
  variants: Product["variants"];
};

export function mapProduct(
  product: SupabaseProduct
): Product {
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

    tags: product.tags,

    images: product.images,

    variants: product.variants,
  };
}