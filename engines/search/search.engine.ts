import { products } from "@/data/products";
import type { Product } from "@/types/product";

class SearchEngine {
  search(query: string): Product[] {
    if (!query.trim()) return products;

    const value = query.toLowerCase();

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(value)
        )
      );
    });
  }

  getBrands() {
    return [...new Set(products.map((p) => p.brand))].sort();
  }

  getCategories() {
    return [...new Set(products.map((p) => p.category))].sort();
  }
}

export const searchEngine = new SearchEngine();