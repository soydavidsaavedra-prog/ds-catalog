export type ProductVariant = {
    color: string;
    sizes: number[];
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
    images: string[];
    variants: ProductVariant[];
  };