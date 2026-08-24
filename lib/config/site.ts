/**
 * Central site configuration.
 * Every brand-facing value (name, WhatsApp number, currency, socials, SEO
 * defaults) lives here so it is never hardcoded across components. This
 * module reads overrides from environment variables and falls back to
 * sane defaults for local development.
 */

const rawWhatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "584121234567";

/** Strips everything except digits, since wa.me links require a bare number. */
function sanitizePhone(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

export const siteConfig = {
  brand: {
    name: "El Nuevo Sánchez",
    shortName: "Nuevo Sánchez",
    initials: "NS",
    tagline: "Especialista en Jeans",
    slogan: "De la fábrica a tus manos",
    description:
      "El Nuevo Sánchez es una fábrica especialista en jeans. Calidad que se siente, estilo que te define.",
  },
  contact: {
    whatsappNumber: sanitizePhone(rawWhatsappNumber),
    whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? "+58 412 123 4567",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "ventas@elnuevosanchez.com",
    location: "Barquisimeto, Venezuela",
  },
  socials: {
    instagram: "https://instagram.com/elnuevosanchez",
    facebook: "https://facebook.com/elnuevosanchez",
    tiktok: "https://tiktok.com/@elnuevosanchez",
  },
  commerce: {
    currency: "USD",
    currencySymbol: "$",
    locale: "es-VE",
  },
  seo: {
    // Platform base domain — each tenant's real URL is /{domain}/{tenantSlug}/...,
    // never a domain of its own (yet; see docs/ARCHITECTURE.md for the
    // custom-domain-per-tenant upgrade path).
    domain: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ds-catalog.vercel.app",
    defaultTitle: "DS Catalog",
    titleTemplate: "%s | DS Catalog",
    defaultDescription:
      "DS Catalog aloja catálogos y tiendas conversacionales independientes bajo un solo motor.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
