import Image from "next/image";
import { parsePlaceholder } from "@/lib/media/placeholder";
import { NSPlaceholderArt } from "@/components/ui/NSPlaceholderArt";
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
        />
      </div>
    );
  }

  // Past this point `placeholder` is null, which only happens when `src` is a truthy,
  // non-"placeholder:" string (see the fallback above) — safe to treat as a real src.
  const realSrc = src as string;

  if (fill) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-surface", className)}>
        <Image
          src={realSrc}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
          priority={priority}
          className="object-cover"
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
