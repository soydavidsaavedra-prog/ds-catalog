import type { SiteSettings } from "@/lib/types/catalog";
import { siteConfig } from "@/lib/config/site";

/**
 * Persisted, admin-editable copy of siteConfig. siteConfig stays the
 * build-time/env fallback; this record is what /admin/configuracion reads
 * and writes so the storefront can be reconfigured without a redeploy.
 */
export const settingsSeed: SiteSettings = {
  brandName: siteConfig.brand.name,
  slogan: siteConfig.brand.slogan,
  whatsappNumber: siteConfig.contact.whatsappNumber,
  currency: siteConfig.commerce.currency,
  instagram: siteConfig.socials.instagram,
  facebook: siteConfig.socials.facebook,
  tiktok: siteConfig.socials.tiktok,
  heroEyebrow: "Calidad · Diseño · Confort",
  heroTitleLine1: "El Nuevo",
  heroTitleLine2: "Sánchez",
  heroSubtitle: "Especialista en Jeans",
  heroTagline: "De la fábrica a tus manos",
  heroCtaLabel: "Explorar colección",
  heroCtaHref: "/catalogo",
  heroImage: "placeholder:hero:hero-1",
  heroImagePositionX: 50,
  heroImagePositionY: 50,
};
