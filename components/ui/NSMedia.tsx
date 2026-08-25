import Image from "next/image";
import { parsePlaceholder } from "@/lib/media/placeholder";
import { NSPlaceholderArt } from "@/components/ui/NSPlaceholderArt";
import { brandInitials } from "@/lib/utils/brand";
import { cn } from "@/lib/utils/cn";

interface NSMediaProps {
  /** Falsy (e.g. a settings column not yet migrated) falls back to placeholder art, same as an explicit "placeholder:" token. */
  src: string | null | undefined;
  alt: string;
  reference?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  /** CSS object-position (e.g. "50% 30%") for a real photo — ignored for placeholder art. */
  objectPosition?: string;
  /** "cover" (default) crops to fill; "contain" shows the whole image with neutral letterboxing instead of cropping anything out. Ignored for placeholder art. */
  objectFit?: "cover" | "contain";
  /** Overrides objectFit only below the sm breakpoint — e.g. a wide hero photo that should show in full on a narrow phone (nothing cropped off the sides) but still crop to fill on wider screens where there's room. Ignored for placeholder art. */
  objectFitMobile?: "cover" | "contain";
  /** Tenant's SiteSettings.brandName — feeds the placeholder plate's watermark initials (default "NS" — El Nuevo Sánchez's own). */
  brandName?: string;
}

/**
 * Media Engine entry point: renders a real photo via next/image, or the
 * designed placeholder plate when the product/category/banner still only
 * has a "placeholder:" token. Every image-consuming component should go
 * through this instead of reaching for <Image> or <img> directly.
 */
export function NSMedia({
  src,
  alt,
  reference,
  className,
  sizes,
  priority,
  fill = true,
  objectPosition,
  objectFit = "cover",
  objectFitMobile,
  brandName,
}: NSMediaProps) {
  const placeholder = parsePlaceholder(src) ?? (src ? null : { category: "otros", seed: "0" });

  if (placeholder) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-ink-900", className)}>
        <NSPlaceholderArt
          category={placeholder.category}
          seed={placeholder.seed}
          label={alt}
          reference={reference}
          className="absolute inset-0"
          monogram={brandName ? brandInitials(brandName) : undefined}
        />
      </div>
    );
  }

  // Past this point `placeholder` is null, which only happens when `src` is a truthy,
  // non-"placeholder:" string (see the fallback above) — safe to treat as a real src.
  const realSrc = src as string;

  if (fill) {
    if (objectFitMobile) {
      // A custom crop-focus objectPosition only makes sense wherever the
      // image is actually being cropped (cover) — applying it under
      // contain just shoves the already-fully-visible image off-center,
      // leaving an empty gap instead of centering it (exactly what showed
      // up as a blank strip above a "fixed" hero photo on mobile). Each
      // breakpoint renders its own <Image> so its object-position can be
      // set independently — a single inline `style` can't vary by
      // breakpoint the way a Tailwind class can.
      return (
        <div className={cn("relative h-full w-full overflow-hidden bg-surface", className)}>
          <Image
            src={realSrc}
            alt={alt}
            fill
            sizes={sizes ?? "100vw"}
            priority={priority}
            className={cn(objectFitMobile === "contain" ? "object-contain" : "object-cover", "sm:hidden")}
            style={objectFitMobile === "cover" && objectPosition ? { objectPosition } : undefined}
          />
          <Image
            src={realSrc}
            alt={alt}
            fill
            sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
            priority={priority}
            className={cn("hidden", objectFit === "contain" ? "sm:object-contain" : "sm:object-cover", "sm:block")}
            style={objectFit === "cover" && objectPosition ? { objectPosition } : undefined}
          />
        </div>
      );
    }

    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-surface", className)}>
        <Image
          src={realSrc}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
          priority={priority}
          className={objectFit === "contain" ? "object-contain" : "object-cover"}
          style={objectPosition ? { objectPosition } : undefined}
        />
      </div>
    );
  }

  return (
    <Image
      src={realSrc}
      alt={alt}
      width={800}
      height={1000}
      priority={priority}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
