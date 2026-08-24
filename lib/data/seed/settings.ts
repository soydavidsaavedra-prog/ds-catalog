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
  brandDescription: siteConfig.brand.description,
  whatsappNumber: siteConfig.contact.whatsappNumber,
  whatsappDisplay: siteConfig.contact.whatsappDisplay,
  contactEmail: siteConfig.contact.email,
  contactAddress: siteConfig.contact.location,
  contactMapsUrl: "",
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
  brandLogo: "",
  paymentBadgeIcon: "",
  paymentBadgeLabel: "Disponible con Cashea",
  storyEyebrow: "Nuestro proceso",
  storyTitle: "De la fábrica a tus manos",
  storyDescription:
    "Cada jean nace en nuestra fábrica: tela seleccionada, corte preciso, confección artesanal y un control de detalle que no se negocia.",
  storyStepImage1: "placeholder:fábrica:story-tela",
  storyStepImage2: "placeholder:fábrica:story-corte",
  storyStepImage3: "placeholder:fábrica:story-confeccion",
  storyStepImage4: "placeholder:fábrica:story-detalle",
  storyStepImage5: "placeholder:fábrica:story-producto",
  statementTitleLine1: "Denim is",
  statementTitleLine2: "our language",
  statementDescription:
    "Calidad que se siente, estilo que te define. Cada pieza sale de nuestra fábrica con un mismo propósito: vestir bien, sin intermediarios.",
  statementImage: "placeholder:denim:brand-statement",
};
