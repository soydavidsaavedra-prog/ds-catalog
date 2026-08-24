import Image from "next/image";
import { parsePlaceholder } from "@/lib/media/placeholder";
import { NSPlaceholderArt } from "@/components/ui/NSPlaceholderArt";
import { cn } from "@/lib/utils/cn";

interface NSMediaProps {
  src: string;
  alt: string;
  reference?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
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
}: NSMediaProps) {
  const placeholder = parsePlaceholder(src);

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

  if (fill) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-surface", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={1000}
      priority={priority}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
