import { products } from "@/data/products";
import type { Product } from "@/types/product";

class ProductRepository {
  getAll(): Product[] {
    return [...products];
  }

  getById(id: number): Product | undefined {
    return products.find((product) => product.id === id);
  }

  getBySlug(slug: string): Product | undefined {
    return products.find((product) => product.slug === slug);
  }

  create(product: Product): void {
    products.push(product);
  }

  update(product: Product): void {
    const index = products.findIndex(
      (p) => p.id === product.id
    );

    if (index >= 0) {
      products[index] = product;
    }
  }

  delete(id: number): void {
    const index = products.findIndex(
      (p) => p.id === id
    );

    if (index >= 0) {
      products.splice(index, 1);
    }
  }
}

export const productRepository =
  new ProductRepository();