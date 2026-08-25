import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * The DS Catalog platform's own mark — distinct from NSLogo, which is
 * tenant-branded (falls back to a generated badge per tenant's
 * brandName/tagline). This one is fixed: it represents the SaaS platform
 * itself (root landing, /registro, and eventually the Super Admin panel),
 * never an individual tenant's storefront or admin panel.
 */
export function DSPlatformMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative block shrink-0", className)}>
      <Image src="/ds-catalog-mark.png" alt="DS Catalog" fill className="object-contain" sizes="200px" priority />
    </span>
  );
}
