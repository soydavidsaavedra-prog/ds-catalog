import { productRepository } from "./product.repository";

class CatalogEngine {
  getAllProducts() {
    return productRepository.getAll();
  }

  getProductBySlug(slug: string) {
    return productRepository.getBySlug(slug);
  }

  getFeaturedProducts() {
    return productRepository
      .getAll()
      .filter((product) => product.featured);
  }

  getProductById(id: number) {
    return productRepository.getById(id);
  }

  createProduct(product: Parameters<typeof productRepository.create>[0]) {
    productRepository.create(product);
  }

  updateProduct(product: Parameters<typeof productRepository.update>[0]) {
    productRepository.update(product);
  }

  deleteProduct(id: number) {
    productRepository.delete(id);
  }
}

export const catalogEngine = new CatalogEngine();