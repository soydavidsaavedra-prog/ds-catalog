import type { BusinessType } from "@/lib/types/tenant";

/**
 * A starting point, seeded once at tenant creation (registerTenantAction /
 * createTenantBySuperadminAction) — never re-applied afterward. The admin
 * is free to rename, delete, or add to these from day one; this only
 * exists so a new tenant doesn't land on a completely empty catalog.
 */
export interface StarterCategory {
  slug: string;
  name: string;
  description: string;
}

export interface BusinessTypeProfile {
  value: BusinessType;
  label: string;
  /** Helper text shown under the option in the registration/creation forms. */
  description: string;
  /** Whether NSProductForm's "Tallas" field makes sense for this kind of business. */
  showSizes: boolean;
  /** Whether NSProductForm's "Colores" field makes sense for this kind of business. */
  showColors: boolean;
  starterCategories: StarterCategory[];
}

/**
 * "moda" is the profile every tenant created before this concept existed
 * (El Nuevo Sánchez, demo) backfills to — sizes and colors both on, same
 * as their current behavior, unchanged. Every other profile is opt-in,
 * chosen at registration or set later by a Super Admin.
 */
export const BUSINESS_TYPE_PROFILES: Record<BusinessType, BusinessTypeProfile> = {
  moda: {
    value: "moda",
    label: "Moda y calzado",
    description: "Ropa, zapatos, accesorios — productos con talla y color.",
    showSizes: true,
    showColors: true,
    starterCategories: [
      { slug: "dama", name: "Dama", description: "Ropa y accesorios para dama." },
      { slug: "caballero", name: "Caballero", description: "Ropa y accesorios para caballero." },
      { slug: "nino", name: "Niño", description: "Ropa y accesorios para niños." },
      { slug: "unisex", name: "Unisex", description: "Productos para todos." },
    ],
  },
  ferreteria: {
    value: "ferreteria",
    label: "Ferretería y construcción",
    description: "Herramientas, materiales e insumos de construcción.",
    showSizes: false,
    showColors: false,
    starterCategories: [
      { slug: "herramientas", name: "Herramientas", description: "Herramientas manuales y eléctricas." },
      { slug: "materiales", name: "Materiales de construcción", description: "Cemento, blocks, tuberías y más." },
      { slug: "electricidad", name: "Electricidad", description: "Cables, interruptores e iluminación." },
      { slug: "pintura", name: "Pintura y acabados", description: "Pinturas, brochas y acabados." },
    ],
  },
  restaurante: {
    value: "restaurante",
    label: "Restaurante y comida",
    description: "Menú de platos, bebidas y combos.",
    showSizes: false,
    showColors: false,
    starterCategories: [
      { slug: "entradas", name: "Entradas", description: "Para abrir el apetito." },
      { slug: "platos-fuertes", name: "Platos fuertes", description: "El plato principal." },
      { slug: "bebidas", name: "Bebidas", description: "Frías, calientes y refrescantes." },
      { slug: "postres", name: "Postres", description: "Para cerrar con algo dulce." },
    ],
  },
  belleza: {
    value: "belleza",
    label: "Belleza y cuidado personal",
    description: "Cosméticos, cuidado de la piel, peluquería.",
    showSizes: false,
    showColors: true,
    starterCategories: [
      { slug: "maquillaje", name: "Maquillaje", description: "Rostro, ojos y labios." },
      { slug: "cuidado-piel", name: "Cuidado de la piel", description: "Limpieza, hidratación y tratamiento." },
      { slug: "cabello", name: "Cabello", description: "Shampoo, tratamientos y styling." },
      { slug: "perfumeria", name: "Perfumería", description: "Fragancias y colonias." },
    ],
  },
  tecnologia: {
    value: "tecnologia",
    label: "Tecnología y electrónica",
    description: "Celulares, computadoras, accesorios y gadgets.",
    showSizes: false,
    showColors: true,
    starterCategories: [
      { slug: "celulares", name: "Celulares", description: "Equipos y accesorios móviles." },
      { slug: "computadoras", name: "Computadoras", description: "Laptops, PCs y periféricos." },
      { slug: "audio-video", name: "Audio y video", description: "Audífonos, bocinas y pantallas." },
      { slug: "accesorios-tech", name: "Accesorios", description: "Cables, cargadores y más." },
    ],
  },
  hogar: {
    value: "hogar",
    label: "Hogar y decoración",
    description: "Muebles, decoración y artículos para el hogar.",
    showSizes: false,
    showColors: true,
    starterCategories: [
      { slug: "muebles", name: "Muebles", description: "Sala, comedor y dormitorio." },
      { slug: "decoracion", name: "Decoración", description: "Cuadros, cortinas y detalles." },
      { slug: "cocina", name: "Cocina", description: "Utensilios y electrodomésticos." },
      { slug: "organizacion", name: "Organización", description: "Almacenamiento y orden." },
    ],
  },
  otro: {
    value: "otro",
    label: "Otro tipo de negocio",
    description: "Cualquier otro rubro — el catálogo arranca en blanco, sin categorías preestablecidas.",
    showSizes: false,
    showColors: false,
    starterCategories: [],
  },
};

export function getBusinessTypeProfile(businessType: BusinessType): BusinessTypeProfile {
  return BUSINESS_TYPE_PROFILES[businessType];
}

/** In a stable, sensible display order for a <select> — Object.values on a Record keyed by string doesn't guarantee this on its own. */
export const BUSINESS_TYPE_OPTIONS: BusinessTypeProfile[] = [
  BUSINESS_TYPE_PROFILES.moda,
  BUSINESS_TYPE_PROFILES.ferreteria,
  BUSINESS_TYPE_PROFILES.restaurante,
  BUSINESS_TYPE_PROFILES.belleza,
  BUSINESS_TYPE_PROFILES.tecnologia,
  BUSINESS_TYPE_PROFILES.hogar,
  BUSINESS_TYPE_PROFILES.otro,
];
