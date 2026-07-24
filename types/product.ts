import type { ProductImage } from "./product-image";

export type ProductSize = {
  id: string;
  size: number;
  stock: number;
  sku: string;
  price?: number;
};

export type ProductVariant = {
  id: string;
  color: string;
  image?: string;
  sizes: ProductSize[];
};

export type Product = {
  id: number;
  slug: string;
  sku: string;

  name: string;

  shortDescription: string;
  description: string;

  brand: string;
  category: string;

  price: number;
  compareAtPrice: number;
  currency: string;

  stock: number;

  active: boolean;
  featured: boolean;

  tags: string[];

  images: ProductImage[];

  variants: ProductVariant[];
};