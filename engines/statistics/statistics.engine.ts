import { catalogEngine } from "@/engines/catalog/catalog.engine";

class StatisticsEngine {
  async totalProducts() {
    const products = await catalogEngine.getAllProducts();

    return products.length;
  }

  async totalBrands() {
    const products = await catalogEngine.getAllProducts();

    return new Set(products.map((p) => p.brand)).size;
  }

  async totalCategories() {
    const products = await catalogEngine.getAllProducts();

    return new Set(products.map((p) => p.category)).size;
  }

  async totalStock() {
    const products = await catalogEngine.getAllProducts();

    return products.reduce(
      (total, product) => total + product.stock,
      0
    );
  }

  async totalFeaturedProducts() {
    const products = await catalogEngine.getAllProducts();

    return products.filter(
      (product) => product.featured
    ).length;
  }

  async averagePrice() {
    const products = await catalogEngine.getAllProducts();

    if (products.length === 0) return 0;

    const total = products.reduce(
      (sum, product) => sum + product.price,
      0
    );

    return Number((total / products.length).toFixed(2));
  }
}

export const statisticsEngine = new StatisticsEngine();