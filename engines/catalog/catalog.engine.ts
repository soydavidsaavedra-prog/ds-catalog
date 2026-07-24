import { productRepository } from "./product.repository";
import type { Product } from "@/types/product";

class CatalogEngine {
  async getAllProducts(): Promise<Product[]> {
    return productRepository.getAll();
  }

  async getProductById(id: number): Promise<Product | null> {
    return productRepository.getById(id);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return productRepository.getBySlug(slug);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await productRepository.getAll();

    return products.filter((product) => product.featured);
  }

  async createProduct(product: Product) {
    await productRepository.create(product);
  }

  async updateProduct(product: Product) {
    await productRepository.update(product);
  }

  async deleteProduct(id: number) {
    await productRepository.delete(id);
  }
}

export const catalogEngine = new CatalogEngine();