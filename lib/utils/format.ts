import { siteConfig } from "@/lib/config/site";
import type { Availability } from "@/lib/types/catalog";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: siteConfig.commerce.currency,
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
