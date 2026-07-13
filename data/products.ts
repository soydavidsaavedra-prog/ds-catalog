import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: 1,
    slug: "nike-air-max",
    sku: "NK-AM-001",
    name: "Nike Air Max",
    shortDescription: "Calzado deportivo cómodo y moderno.",
    description:
      "Diseñado para ofrecer comodidad, estilo y rendimiento durante todo el día.",
    brand: "Nike",
    category: "Zapatos",
    price: 25,
    compareAtPrice: 35,
    currency: "USD",
    stock: 12,
    active: true,
    featured: true,
    tags: ["Deportivo", "Running", "Nuevo"],
    images: [
      "/products/nike-air-max-1.jpg",
      "/products/nike-air-max-2.jpg",
    ],
    variants: [
      {
        color: "Negro",
        sizes: [38, 39, 40, 41],
      },
      {
        color: "Blanco",
        sizes: [39, 40, 42],
      },
    ],
  },

  {
    id: 2,
    slug: "adidas-campus",
    sku: "AD-001",
    name: "Adidas Campus",
    shortDescription: "Calzado deportivo cómodo y moderno.",
    description:
      "Diseñado para ofrecer comodidad, estilo y rendimiento durante todo el día.",
    brand: "Adidas",
    category: "Zapatos",
    price: 40,
    compareAtPrice: 50,
    currency: "USD",
    stock: 10,
    active: true,
    featured: true,
    tags: ["Lifestyle", "Casual"],
    images: [
      "/products/adidas-campus-1.jpg",
      "/products/adidas-campus-2.jpg",
    ],
    variants: [
      {
        color: "Gris",
        sizes: [38, 39, 40, 41],
      },
      {
        color: "Blanco",
        sizes: [39, 40, 42],
      },
    ],
  },

  {
    id: 3,
    slug: "new-balance-530",
    sku: "NB-530",
    name: "New Balance 530",
    shortDescription: "Calzado deportivo cómodo y moderno.",
    description:
      "Diseñado para ofrecer comodidad, estilo y rendimiento durante todo el día.",
    brand: "New Balance",
    category: "Zapatos",
    price: 55,
    compareAtPrice: 70,
    currency: "USD",
    stock: 8,
    active: true,
    featured: true,
    tags: ["Running", "Retro"],
    images: [
      "/products/new-balance-530-1.jpg",
      "/products/new-balance-530-2.jpg",
    ],
    variants: [
      {
        color: "Blanco",
        sizes: [39, 40, 41, 42],
      },
      {
        color: "Gris",
        sizes: [38, 39, 40],
      },
    ],
  },

  {
    id: 4,
    slug: "puma-rider",
    sku: "PU-001",
    name: "Puma Rider",
    shortDescription: "Calzado deportivo cómodo y moderno.",
    description:
      "Diseñado para ofrecer comodidad, estilo y rendimiento durante todo el día.",
    brand: "Puma",
    category: "Zapatos",
    price: 38,
    compareAtPrice: 45,
    currency: "USD",
    stock: 15,
    active: true,
    featured: true,
    tags: ["Sport", "Nuevo"],
    images: [
      "/products/puma-rider-1.jpg",
      "/products/puma-rider-2.jpg",
    ],
    variants: [
      {
        color: "Negro",
        sizes: [38, 39, 40, 41],
      },
      {
        color: "Rojo",
        sizes: [40, 41, 42],
      },
    ],
  },
];