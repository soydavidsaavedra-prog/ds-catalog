import { products } from "@/data/products";

class StatisticsEngine {
  totalProducts() {
    return products.length;
  }

  totalBrands() {
    return new Set(products.map((p) => p.brand)).size;
  }

  totalCategories() {
    return new Set(products.map((p) => p.category)).size;
  }

  totalStock() {
    return products.reduce(
      (total, product) => total + product.stock,
      0
    );
  }

  totalFeaturedProducts() {
    return products.filter(
      (product) => product.featured
    ).length;
  }

  averagePrice() {
    if (products.length === 0) return 0;

    const total = products.reduce(
      (sum, product) => sum + product.price,
      0
    );

    return Number((total / products.length).toFixed(2));
  }
}

export const statisticsEngine = new StatisticsEngine();