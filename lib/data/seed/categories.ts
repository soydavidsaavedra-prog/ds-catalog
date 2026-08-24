import type { Category } from "@/lib/types/catalog";

const now = "2026-01-15T00:00:00.000Z";

function category(partial: Omit<Category, "createdAt" | "updatedAt">): Category {
  return { ...partial, createdAt: now, updatedAt: now };
}

/**
 * Garment-type categories. These are the primary catalog taxonomy and each
 * has its own route at /[slug] powered by the shared catalog engine. Fully
 * admin-manageable (create/edit/delete/reorder/activate) — nothing here is
 * hardcoded into components, this seed only bootstraps the demo store.
 */
export const categoriesSeed: Category[] = [
  category({
    id: "cat-skinny",
    slug: "skinny",
    name: "Skinny",
    description: "Ajuste perfecto que realza tu estilo y figura.",
    image: "placeholder:skinny:1",
    order: 1,
    active: true,
    featured: true,
  }),
  category({
    id: "cat-cargo",
    slug: "cargo",
    name: "Cargo",
    description: "Bolsillos utilitarios con actitud urbana.",
    image: "placeholder:cargo:1",
    order: 2,
    active: true,
    featured: true,
  }),
  category({
    id: "cat-jogger",
    slug: "jogger",
    name: "Jogger",
    description: "Comodidad de jogger con carácter denim.",
    image: "placeholder:jogger:1",
    order: 3,
    active: true,
    featured: true,
  }),
  category({
    id: "cat-clasicos",
    slug: "clasicos",
    name: "Clásicos",
    description: "El corte recto que nunca pasa de moda.",
    image: "placeholder:clasicos:1",
    order: 4,
    active: true,
    featured: true,
  }),
  category({
    id: "cat-franelas",
    slug: "franelas",
    name: "Franelas",
    description: "Básicos de algodón para el día a día.",
    image: "placeholder:franelas:1",
    order: 5,
    active: true,
    featured: false,
  }),
  category({
    id: "cat-camisas",
    slug: "camisas",
    name: "Camisas",
    description: "Camisas de mezclilla y algodón, corte moderno.",
    image: "placeholder:camisas:1",
    order: 6,
    active: true,
    featured: false,
  }),
  category({
    id: "cat-chaquetas",
    slug: "chaquetas",
    name: "Chaquetas",
    description: "Denim jackets con acabado industrial.",
    image: "placeholder:chaquetas:1",
    order: 7,
    active: true,
    featured: false,
  }),
  category({
    id: "cat-faldas",
    slug: "faldas",
    name: "Faldas",
    description: "Faldas denim de fábrica, para toda ocasión.",
    image: "placeholder:faldas:1",
    order: 8,
    active: true,
    featured: false,
  }),
  category({
    id: "cat-otros",
    slug: "otros",
    name: "Otros",
    description: "Accesorios y piezas complementarias de la colección.",
    image: "placeholder:otros:1",
    order: 9,
    active: true,
    featured: false,
  }),
];
