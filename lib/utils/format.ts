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
