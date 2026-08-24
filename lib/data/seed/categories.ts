import type { Category } from "@/lib/types/catalog";

const now = "2026-01-15T00:00:00.000Z";

function category(partial: Omit<Category, "createdAt" | "updatedAt">): Category {
  return { ...partial, createdAt: now, updatedAt: now };
}

/**
 * Two-level taxonomy: Dama / Caballero / Niño (+ Unisex, not featured on the
 * home tiles) as top-level categories, with garment-type subcategories
 * (Skinny, Cargo, Jogger, ...) nested under each via parentId. Each has its
 * own route at /[slug] powered by the shared catalog engine — a top-level
 * slug aggregates products across all its subcategories, a subcategory slug
 * shows just that cut. Fully admin-manageable, nothing hardcoded into
 * components — this seed only bootstraps the demo store.
 */

interface ParentDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  featured: boolean;
}

const PARENTS: ParentDef[] = [
  { id: "cat-dama", slug: "dama", name: "Dama", description: "Todo el denim para dama.", featured: true },
  { id: "cat-caballero", slug: "caballero", name: "Caballero", description: "Todo el denim para caballero.", featured: true },
  { id: "cat-nino", slug: "nino", name: "Niño", description: "Todo el denim para niños.", featured: true },
  { id: "cat-unisex", slug: "unisex", name: "Unisex", description: "Piezas para todos.", featured: false },
];

interface SubtypeDef {
  slug: string;
  name: string;
  description: string;
}

const SUBTYPES: Record<string, SubtypeDef> = {
  skinny: { slug: "skinny", name: "Skinny", description: "Ajuste perfecto que realza tu estilo y figura." },
  cargo: { slug: "cargo", name: "Cargo", description: "Bolsillos utilitarios con actitud urbana." },
  jogger: { slug: "jogger", name: "Jogger", description: "Comodidad de jogger con carácter denim." },
  clasicos: { slug: "clasicos", name: "Clásicos", description: "El corte recto que nunca pasa de moda." },
  franelas: { slug: "franelas", name: "Franelas", description: "Básicos de algodón para el día a día." },
  camisas: { slug: "camisas", name: "Camisas", description: "Camisas de mezclilla y algodón, corte moderno." },
  chaquetas: { slug: "chaquetas", name: "Chaquetas", description: "Denim jackets con acabado industrial." },
  faldas: { slug: "faldas", name: "Faldas", description: "Faldas denim de fábrica, para toda ocasión." },
  otros: { slug: "otros", name: "Otros", description: "Accesorios y piezas complementarias de la colección." },
};

// Which subcategories exist under each parent — matches the demo product catalog.
const SUBCATEGORIES_BY_PARENT: Record<string, string[]> = {
  dama: ["skinny", "cargo", "jogger", "clasicos", "franelas", "camisas", "chaquetas", "faldas", "otros"],
  caballero: ["skinny", "cargo", "jogger", "clasicos", "camisas", "chaquetas"],
  nino: ["skinny", "jogger", "clasicos", "franelas", "faldas"],
  unisex: ["jogger", "clasicos", "franelas", "chaquetas", "otros"],
};

const parentCategories: Category[] = PARENTS.map((parent, index) =>
  category({
    id: parent.id,
    slug: parent.slug,
    name: parent.name,
    description: parent.description,
    image: `placeholder:${parent.slug}:1`,
    order: index + 1,
    active: true,
    featured: parent.featured,
    parentId: null,
  }),
);

const subcategories: Category[] = PARENTS.flatMap((parent, parentIndex) =>
  (SUBCATEGORIES_BY_PARENT[parent.slug] ?? []).map((typeSlug, typeIndex) => {
    const type = SUBTYPES[typeSlug];
    return category({
      id: `cat-${parent.slug}-${type.slug}`,
      slug: `${parent.slug}-${type.slug}`,
      name: type.name,
      description: type.description,
      image: `placeholder:${type.slug}:${parent.slug}`,
      order: PARENTS.length + parentIndex * 10 + typeIndex + 1,
      active: true,
      featured: parentIndex === 0,
      parentId: parent.id,
    });
  }),
);

export const categoriesSeed: Category[] = [...parentCategories, ...subcategories];
