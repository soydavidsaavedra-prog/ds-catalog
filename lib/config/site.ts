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
    domain: process.env.NEXT_PUBLIC_SITE_URL ?? "https://elnuevosanchez.com",
    defaultTitle: "El Nuevo Sánchez — Especialista en Jeans",
    titleTemplate: "%s | El Nuevo Sánchez",
    defaultDescription:
      "Jeans y ropa de fábrica directo a tus manos. Skinny, cargo, jogger, clásicos y más. Calidad premium, precios de fábrica.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
