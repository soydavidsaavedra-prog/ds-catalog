import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Small payment-method badge (e.g. "Disponible con Cashea") shown on
 * product cards and the product detail page. Sourced from
 * SiteSettings.paymentBadgeIcon/paymentBadgeLabel (admin-uploadable via
 * /admin/configuracion) — renders nothing when no icon has been set, or
 * when the product opted out via Product.hidePaymentBadge.
 */
export function NSPaymentBadge({
  icon,
  label,
  size = "sm",
  className,
}: {
  icon: string;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!icon) return null;
  const dimension = size === "sm" ? 24 : 32;

  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-0 shadow-card",
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        className,
      )}
    >
      <Image src={icon} alt={label} width={dimension} height={dimension} className="h-full w-full object-contain" />
    </span>
  );
}
