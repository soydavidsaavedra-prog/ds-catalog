import { parsePlaceholder } from "@/lib/media/placeholder";
import type { Category, HeroSlide, Product, SiteSettings } from "@/lib/types/catalog";

export interface StoreScoreCriterion {
  id: string;
  label: string;
  done: boolean;
  /** Admin path (no tenant slug — the caller prefixes it) that fixes this criterion. */
  href: string;
}

export interface StoreScoreResult {
  score: number;
  criteria: StoreScoreCriterion[];
}

function hasRealImage(value: string): boolean {
  return Boolean(value) && !parsePlaceholder(value);
}

/**
 * Every criterion maps to a real field this app already stores — nothing
 * fabricated (see the Fase 0 audit: no "navegación"/"responsive" criteria,
 * since those aren't things a tenant configures per-store). Score is
 * simply done/total as a percentage. Purely advisory — see
 * NSStoreScoreCard, never used to gate a feature.
 */
export function computeStoreScore({
  settings,
  products,
  categories,
  heroSlides,
}: {
  settings: SiteSettings;
  products: Product[];
  categories: Category[];
  heroSlides: HeroSlide[];
}): StoreScoreResult {
  const activeProducts = products.filter((p) => p.active);
  const hasProductPhoto = activeProducts.some((p) => p.images.some((img) => hasRealImage(img)));
  const hasCustomHero = heroSlides.length > 0 || hasRealImage(settings.heroImage);

  const criteria: StoreScoreCriterion[] = [
    { id: "logo", label: "Sube el logo de tu marca", done: hasRealImage(settings.brandLogo), href: "/admin/configuracion" },
    { id: "accent", label: "Elige el color de tu marca", done: settings.accentColor !== null, href: "/admin/configuracion" },
    { id: "categories", label: "Crea al menos una categoría", done: categories.length > 0, href: "/admin/categorias" },
    { id: "products", label: "Agrega tus primeros productos", done: activeProducts.length > 0, href: "/admin/productos" },
    { id: "photos", label: "Sube fotos reales a tus productos", done: hasProductPhoto, href: "/admin/productos" },
    { id: "hero", label: "Personaliza la portada de tu inicio", done: hasCustomHero, href: "/admin/inicio" },
    { id: "whatsapp", label: "Configura tu WhatsApp para recibir pedidos", done: Boolean(settings.whatsappNumber.trim()), href: "/admin/configuracion" },
    {
      id: "contact",
      label: "Agrega tu información de contacto",
      done: Boolean(settings.contactEmail.trim() || settings.contactAddress.trim()),
      href: "/admin/configuracion",
    },
  ];

  const done = criteria.filter((c) => c.done).length;
  const score = Math.round((done / criteria.length) * 100);

  return { score, criteria };
}
