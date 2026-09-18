import { siteConfig } from "@/lib/config/site";
import { getCurrencyMeta } from "@/lib/config/currencies";
import type { Availability } from "@/lib/types/catalog";

/**
 * `currency` defaults to "USD" so every existing call site that doesn't pass
 * one (DS Catalog's own subscription/billing prices — NSAccountPlanCard,
 * NSOnboardingWizard, the landing's plans section, Super Admin's plans page)
 * keeps showing USD untouched. Storefront/tenant call sites pass the
 * tenant's `settings.currency` explicitly.
 */
export function formatPrice(amount: number, currency: string = siteConfig.commerce.currency): string {
  const { locale } = getCurrencyMeta(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export const availabilityLabel: Record<Availability, string> = {
  in_stock: "Disponible",
  low_stock: "Pocas unidades",
  out_of_stock: "Agotado",
};

export function absoluteUrl(path: string): string {
  const domain = siteConfig.seo.domain.replace(/\/$/, "");
  return `${domain}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Used by /superadmin's Storage pages — real byte counts from lib/repositories/storage-repository.ts, never a guess. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
