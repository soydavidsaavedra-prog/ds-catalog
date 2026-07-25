import type { Product } from "@/types/product";

export type ProductSort =
  | "newest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

type FilterProductsParams = {
  products: Product[];
  query?: string;
  brand?: string;
  category?: string;
  onlyAvailable?: boolean;
  sort?: ProductSort;
};

class SearchEngine {
  filterProducts({
    products,
    query = "",
    brand = "",
    category = "",
    onlyAvailable = false,
    sort = "newest",
  }: FilterProductsParams): Product[] {
    let result = [...products];

    // Buscar
    if (query.trim()) {
      const value = query.toLowerCase();

      result = result.filter((product) => {
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

    // Marca
    if (brand) {
      result = result.filter(
        (product) => product.brand === brand
      );
    }

    // Categoría
    if (category) {
      result = result.filter(
        (product) => product.category === category
      );
    }

    // Disponibilidad
    if (onlyAvailable) {
      result = result.filter(
        (product) => product.stock > 0
      );
    }

    // Ordenamiento
    switch (sort) {
      case "name-asc":
        result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      case "name-desc":
        result.sort((a, b) =>
          b.name.localeCompare(a.name)
        );
        break;

      case "price-asc":
        result.sort((a, b) =>
          a.price - b.price
        );
        break;

      case "price-desc":
        result.sort((a, b) =>
          b.price - a.price
        );
        break;

      case "newest":
      default:
        break;
    }

    return result;
  }

  getBrands(products: Product[]) {
    return [...new Set(products.map((p) => p.brand))].sort();
  }

  getCategories(products: Product[]) {
    return [...new Set(products.map((p) => p.category))].sort();
  }
}

export const searchEngine = new SearchEngine();