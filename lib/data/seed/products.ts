import type { Product, ProductColor } from "@/lib/types/catalog";

const now = "2026-01-15T00:00:00.000Z";

const COLORS = {
  azul: { name: "Azul", hex: "#3f628a" },
  azulOscuro: { name: "Azul Oscuro", hex: "#233a55" },
  azulClaro: { name: "Azul Claro", hex: "#82a3c8" },
  negro: { name: "Negro", hex: "#1c1b1a" },
  gris: { name: "Gris", hex: "#8a8a84" },
  destroyed: { name: "Destroyed", hex: "#7d97ad" },
  caqui: { name: "Caqui", hex: "#8a7f5c" },
  verdeMilitar: { name: "Verde Militar", hex: "#4b5a3a" },
  blanco: { name: "Blanco", hex: "#f7f7f6" },
  crudo: { name: "Crudo", hex: "#d9d0b8" },
} satisfies Record<string, ProductColor>;

interface Seed {
  id: string;
  ref: string;
  name: string;
  price: number;
  wholesale: number;
  category: string;
  audience: Product["audience"];
  sizes: string[];
  colors: ProductColor[];
  availability: Product["availability"];
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  active?: boolean;
  description: string;
}

const DAMA_SIZES = ["6", "8", "10", "12", "14"];
const CABALLERO_SIZES = ["28", "30", "32", "34", "36", "38"];
const NINO_SIZES = ["4", "6", "8", "10", "12"];
const APPAREL_SIZES = ["S", "M", "L", "XL"];

const seeds: Seed[] = [
  // ---- SKINNY ----
  {
    id: "p-001", ref: "NS-001", name: "Jean Skinny Dama", price: 25, wholesale: 17,
    category: "skinny", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.azul, COLORS.negro], availability: "in_stock",
    featured: true, isNew: true,
    description: "Jean skinny de tiro medio, confeccionado con denim de alta calidad que brinda comodidad y estilo. Ideal para cualquier ocasión.",
  },
  {
    id: "p-002", ref: "NS-002", name: "Jean Skinny Negro Dama", price: 25, wholesale: 17,
    category: "skinny", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.negro], availability: "in_stock", isNew: true,
    description: "Skinny negro de tiro alto con elastano para un ajuste que acompaña el movimiento sin perder forma.",
  },
  {
    id: "p-003", ref: "NS-003", name: "Jean Skinny Gris Dama", price: 25, wholesale: 17,
    category: "skinny", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.gris], availability: "in_stock", isNew: true,
    description: "Tono gris lavado con textura suave, perfecto para combinar con básicos de temporada.",
  },
  {
    id: "p-004", ref: "NS-028", name: "Jean Skinny Destroyed Dama", price: 27, wholesale: 19,
    category: "skinny", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.destroyed, COLORS.azul], availability: "low_stock", isNew: true,
    description: "Rotos trabajados a mano sobre denim premium. Pieza statement de la colección actual.",
  },
  {
    id: "p-005", ref: "NS-010", name: "Jean Skinny Caballero", price: 26, wholesale: 18,
    category: "skinny", audience: "caballero", sizes: CABALLERO_SIZES,
    colors: [COLORS.azulOscuro, COLORS.negro], availability: "in_stock",
    description: "Corte ajustado sin perder movilidad. Denim de fábrica con acabado mate.",
  },
  {
    id: "p-006", ref: "NS-011", name: "Jean Skinny Niño", price: 20, wholesale: 13,
    category: "skinny", audience: "nino", sizes: NINO_SIZES,
    colors: [COLORS.azul], availability: "in_stock",
    description: "Resistencia para el día a día, con tela elástica pensada para niños activos.",
  },
  // ---- CARGO ----
  {
    id: "p-007", ref: "NS-023", name: "Jean Cargo Clásico", price: 28, wholesale: 20,
    category: "cargo", audience: "caballero", sizes: CABALLERO_SIZES,
    colors: [COLORS.negro, COLORS.caqui], availability: "in_stock",
    featured: true, isNew: true,
    description: "Cargo de bolsillos utilitarios en denim reforzado. Actitud urbana con acabado de fábrica.",
  },
  {
    id: "p-008", ref: "NS-024", name: "Jean Cargo Caqui", price: 28, wholesale: 20,
    category: "cargo", audience: "caballero", sizes: CABALLERO_SIZES,
    colors: [COLORS.caqui], availability: "in_stock",
    description: "Tono caqui versátil, bolsillos laterales con solapa y costuras reforzadas.",
  },
  {
    id: "p-009", ref: "NS-025", name: "Jean Cargo Militar", price: 29, wholesale: 20,
    category: "cargo", audience: "caballero", sizes: CABALLERO_SIZES,
    colors: [COLORS.verdeMilitar], availability: "low_stock",
    description: "Inspiración militar con seis bolsillos funcionales y tiro regular.",
  },
  {
    id: "p-010", ref: "NS-026", name: "Jean Cargo Dama", price: 27, wholesale: 19,
    category: "cargo", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.negro, COLORS.gris], availability: "in_stock",
    description: "Cargo femenino de tiro alto, silueta relajada con bolsillos frontales cargo.",
  },
  // ---- JOGGER ----
  {
    id: "p-011", ref: "NS-045", name: "Jean Jogger Urban", price: 26, wholesale: 18,
    category: "jogger", audience: "caballero", sizes: CABALLERO_SIZES,
    colors: [COLORS.gris, COLORS.negro], availability: "in_stock", featured: true,
    description: "Puño elástico en el tobillo y comodidad de jogger sobre denim resistente.",
  },
  {
    id: "p-012", ref: "NS-046", name: "Jean Jogger Dama", price: 25, wholesale: 17,
    category: "jogger", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.azul], availability: "in_stock",
    description: "Cintura elástica con cordón interno, silueta jogger cómoda para el día completo.",
  },
  {
    id: "p-013", ref: "NS-047", name: "Jean Jogger Niño", price: 21, wholesale: 14,
    category: "jogger", audience: "nino", sizes: NINO_SIZES,
    colors: [COLORS.azul, COLORS.gris], availability: "in_stock",
    description: "Ideal para jugar y moverse. Denim suave con puño elástico ajustable.",
  },
  {
    id: "p-014", ref: "NS-048", name: "Jean Jogger Negro", price: 26, wholesale: 18,
    category: "jogger", audience: "unisex", sizes: CABALLERO_SIZES,
    colors: [COLORS.negro], availability: "out_of_stock",
    description: "Negro profundo de lavado mínimo, silueta jogger unisex.",
  },
  // ---- CLÁSICOS ----
  {
    id: "p-015", ref: "NS-067", name: "Jean Clásico Azul", price: 24, wholesale: 16,
    category: "clasicos", audience: "caballero", sizes: CABALLERO_SIZES,
    colors: [COLORS.azul, COLORS.azulOscuro], availability: "in_stock",
    description: "El corte recto de siempre. Denim robusto de fábrica, hecho para durar.",
  },
  {
    id: "p-016", ref: "NS-068", name: "Jean Clásico Dama", price: 24, wholesale: 16,
    category: "clasicos", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.azul], availability: "in_stock",
    description: "Silueta recta atemporal con tiro medio y lavado uniforme.",
  },
  {
    id: "p-017", ref: "NS-069", name: "Jean Clásico Negro", price: 24, wholesale: 16,
    category: "clasicos", audience: "unisex", sizes: CABALLERO_SIZES,
    colors: [COLORS.negro], availability: "in_stock",
    description: "Negro clásico de corte recto, básico infaltable del clóset.",
  },
  {
    id: "p-018", ref: "NS-070", name: "Jean Clásico Niño", price: 19, wholesale: 12,
    category: "clasicos", audience: "nino", sizes: NINO_SIZES,
    colors: [COLORS.azul], availability: "in_stock",
    description: "Corte recto clásico en talla infantil, resistente al uso diario.",
  },
  // ---- FRANELAS ----
  {
    id: "p-019", ref: "NS-080", name: "Franela Básica NS", price: 10, wholesale: 6,
    category: "franelas", audience: "unisex", sizes: APPAREL_SIZES,
    colors: [COLORS.negro, COLORS.blanco, COLORS.gris], availability: "in_stock", featured: true,
    description: "Algodón 100% peinado, corte regular. El básico que combina con todo.",
  },
  {
    id: "p-020", ref: "NS-081", name: "Franela Logo NS", price: 12, wholesale: 7,
    category: "franelas", audience: "unisex", sizes: APPAREL_SIZES,
    colors: [COLORS.negro, COLORS.blanco], availability: "in_stock", isNew: true,
    description: "Franela con el monograma NS estampado al pecho, algodón grueso.",
  },
  {
    id: "p-021", ref: "NS-082", name: "Franela Dama Oversize", price: 12, wholesale: 7,
    category: "franelas", audience: "dama", sizes: APPAREL_SIZES,
    colors: [COLORS.blanco, COLORS.negro], availability: "in_stock",
    description: "Fit oversize de algodón suave, ideal para combinar con denim skinny.",
  },
  {
    id: "p-022", ref: "NS-083", name: "Franela Niño Básica", price: 8, wholesale: 5,
    category: "franelas", audience: "nino", sizes: NINO_SIZES,
    colors: [COLORS.blanco, COLORS.azul], availability: "in_stock",
    description: "Algodón suave hipoalergénico, pensado para la piel sensible de los más pequeños.",
  },
  // ---- CAMISAS ----
  {
    id: "p-023", ref: "NS-090", name: "Camisa Denim Caballero", price: 22, wholesale: 15,
    category: "camisas", audience: "caballero", sizes: APPAREL_SIZES,
    colors: [COLORS.azul, COLORS.azulOscuro], availability: "in_stock", featured: true,
    description: "Camisa de mezclilla ligera con botones metálicos y bolsillos frontales.",
  },
  {
    id: "p-024", ref: "NS-091", name: "Camisa Denim Dama", price: 22, wholesale: 15,
    category: "camisas", audience: "dama", sizes: APPAREL_SIZES,
    colors: [COLORS.azulClaro, COLORS.crudo], availability: "in_stock",
    description: "Silueta entallada en denim liviano, perfecta para anudar o usar suelta.",
  },
  {
    id: "p-025", ref: "NS-092", name: "Camisa Cuadros Caballero", price: 20, wholesale: 13,
    category: "camisas", audience: "caballero", sizes: APPAREL_SIZES,
    colors: [COLORS.negro, COLORS.gris], availability: "low_stock",
    description: "Franela de cuadros en algodón grueso, corte regular con doble bolsillo.",
  },
  // ---- CHAQUETAS ----
  {
    id: "p-026", ref: "NS-100", name: "Chaqueta Denim Clásica", price: 38, wholesale: 27,
    category: "chaquetas", audience: "unisex", sizes: APPAREL_SIZES,
    colors: [COLORS.azul, COLORS.azulOscuro], availability: "in_stock", featured: true,
    description: "La chaqueta denim insignia de la fábrica. Corte atemporal, costuras dobles.",
  },
  {
    id: "p-027", ref: "NS-101", name: "Chaqueta Denim Destroyed", price: 42, wholesale: 30,
    category: "chaquetas", audience: "caballero", sizes: APPAREL_SIZES,
    colors: [COLORS.destroyed], availability: "low_stock", isNew: true,
    description: "Acabado destroyed trabajado a mano sobre denim de peso pesado.",
  },
  {
    id: "p-028", ref: "NS-102", name: "Chaqueta Denim Dama Crop", price: 36, wholesale: 25,
    category: "chaquetas", audience: "dama", sizes: APPAREL_SIZES,
    colors: [COLORS.azulClaro, COLORS.negro], availability: "in_stock",
    description: "Corte crop entallado, botones metálicos y forro interior suave.",
  },
  // ---- FALDAS ----
  {
    id: "p-029", ref: "NS-110", name: "Falda Denim Midi", price: 24, wholesale: 16,
    category: "faldas", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.azul, COLORS.crudo], availability: "in_stock", featured: true,
    description: "Largo midi con abertura frontal y botonadura completa en denim rígido.",
  },
  {
    id: "p-030", ref: "NS-111", name: "Falda Denim Corta", price: 20, wholesale: 13,
    category: "faldas", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.azulClaro, COLORS.destroyed], availability: "in_stock",
    description: "Falda corta con bolsillos delanteros y bastilla deshilachada.",
  },
  {
    id: "p-031", ref: "NS-112", name: "Falda Denim Niña", price: 16, wholesale: 10,
    category: "faldas", audience: "nino", sizes: NINO_SIZES,
    colors: [COLORS.azul], availability: "in_stock",
    description: "Falda denim ajustable en cintura, cómoda y resistente para el colegio o el juego.",
  },
  // ---- OTROS ----
  {
    id: "p-032", ref: "NS-120", name: "Gorra NS Denim", price: 9, wholesale: 5,
    category: "otros", audience: "unisex", sizes: ["Única"],
    colors: [COLORS.azul, COLORS.negro], availability: "in_stock",
    description: "Gorra estructurada en denim con bordado NS al frente, cierre ajustable.",
  },
  {
    id: "p-033", ref: "NS-121", name: "Cinturón Cuero NS", price: 14, wholesale: 9,
    category: "otros", audience: "unisex", sizes: ["S/M", "L/XL"],
    colors: [COLORS.negro], availability: "in_stock",
    description: "Cinturón de cuero genuino con hebilla metálica grabada NS.",
  },
  {
    id: "p-034", ref: "NS-122", name: "Bolso Denim Tote", price: 18, wholesale: 12,
    category: "otros", audience: "dama", sizes: ["Única"],
    colors: [COLORS.azul, COLORS.crudo], availability: "low_stock", isNew: true,
    description: "Tote bag en retazos de denim reciclado de fábrica, forro interior resistente.",
  },
  {
    id: "p-035", ref: "NS-016", name: "Jean Negro Premium", price: 27, wholesale: 19,
    category: "clasicos", audience: "caballero", sizes: CABALLERO_SIZES,
    colors: [COLORS.negro], availability: "in_stock", onSale: true,
    description: "Línea premium con denim de mayor gramaje y acabado sedoso.",
  },
  {
    id: "p-036", ref: "NS-053", name: "Jean Skinny Azul Oferta", price: 22, wholesale: 15,
    category: "skinny", audience: "dama", sizes: DAMA_SIZES,
    colors: [COLORS.azul], availability: "in_stock", onSale: true,
    description: "Edición de temporada pasada a precio especial. Últimas unidades.",
  },
];

function toProduct(seed: Seed): Product {
  const slugBase = seed.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    id: seed.id,
    slug: `${seed.ref.toLowerCase()}-${slugBase}`,
    reference: seed.ref,
    name: seed.name,
    price: seed.price,
    wholesalePrice: seed.wholesale,
    description: seed.description,
    categorySlug: `${seed.audience}-${seed.category}`,
    audience: seed.audience,
    images: [`placeholder:${seed.category}:${seed.id}`],
    cardAspectRatio: "portrait",
    imageFit: "cover",
    sizes: seed.sizes,
    colors: seed.colors,
    availability: seed.availability,
    featured: seed.featured ?? false,
    isNew: seed.isNew ?? false,
    onSale: seed.onSale ?? false,
    active: seed.active ?? true,
    hidePaymentBadge: false,
    createdAt: now,
    updatedAt: now,
  };
}

export const productsSeed: Product[] = seeds.map(toProduct);
