import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { parsePlaceholder } from "@/lib/media/placeholder";

/**
 * NSLogo — the El Nuevo Sánchez monogram.
 *
 * When `src` is a real uploaded image (set via /admin/configuracion →
 * SiteSettings.brandLogo), it's rendered as-is — the uploaded badge already
 * contains the full mark + wordmark, so it's used for both "mark" and
 * "full" variants. Without a real `src`, this falls back to a faithful SVG
 * *recreation* of the original mark (circular badge, gold ring, arced
 * "EL NUEVO SÁNCHEZ" / "ESPECIALISTA EN JEANS" wordmarks, NS monogram) —
 * built because the original logo asset arrived only as an inline chat
 * image, not a file this project could read from disk directly.
 */

interface NSLogoProps {
  className?: string;
  /** "mark" = badge only. "full" = badge + wordmark, for wide headers. */
  variant?: "mark" | "full";
  tone?: "gold-on-black" | "black-on-transparent";
  /** Pass a unique value when rendering more than one NSLogo on the same page (e.g. header + footer) so SVG ids don't collide. */
  id?: string;
  /** Real uploaded logo URL (SiteSettings.brandLogo). Falsy/placeholder = use the SVG recreation below. */
  src?: string;
}

export function NSLogo({
  className,
  variant = "mark",
  tone = "gold-on-black",
  id = "ns-logo",
  src,
}: NSLogoProps) {
  if (src && !parsePlaceholder(src)) {
    // The uploaded badge already contains the full mark + wordmark baked in,
    // so both variants just render it — "full" only needs a larger default
    // size since it has no separate icon+text layout to fill.
    const defaultSize = variant === "full" ? "h-16 w-16 sm:h-20 sm:w-20" : "h-10 w-10";
    return (
      <span className={cn("relative block shrink-0", defaultSize, className)}>
        <Image src={src} alt="El Nuevo Sánchez" fill className="object-contain" sizes="200px" />
      </span>
    );
  }

  const topArcId = `${id}-top`;
  const bottomArcId = `${id}-bottom`;

  const ring = tone === "gold-on-black" ? "var(--color-gold-400)" : "var(--color-ink-950)";
  const fill = tone === "gold-on-black" ? "var(--color-ink-950)" : "transparent";
  const ink = tone === "gold-on-black" ? "var(--color-gold-400)" : "var(--color-ink-950)";

  const mark = (
    <svg
      viewBox="0 0 200 200"
      className={variant === "mark" ? className : "h-full w-auto"}
      role="img"
      aria-label="El Nuevo Sánchez — Especialista en Jeans"
    >
      <circle cx="100" cy="100" r="94" fill={fill} />
      <circle cx="100" cy="100" r="90" fill="none" stroke={ring} strokeWidth="2.5" />
      <circle cx="100" cy="100" r="78" fill="none" stroke={ring} strokeWidth="1" opacity="0.5" />

      <path id={topArcId} d="M 26 100 A 74 74 0 0 1 174 100" fill="none" />
      <path id={bottomArcId} d="M 34 128 A 74 74 0 0 0 166 128" fill="none" />

      <text fill={ink} fontSize="13.5" fontWeight="600" letterSpacing="2.6">
        <textPath href={`#${topArcId}`} startOffset="50%" textAnchor="middle">
          EL NUEVO SÁNCHEZ
        </textPath>
      </text>
      <text fill={ink} fontSize="11.5" fontWeight="600" letterSpacing="2.2">
        <textPath href={`#${bottomArcId}`} startOffset="50%" textAnchor="middle">
          ESPECIALISTA EN JEANS
        </textPath>
      </text>

      <g transform="translate(100 101)">
        <path
          d="M -38 -4 A 40 40 0 1 1 -20 32"
          fill="none"
          stroke={ink}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <text
          x="0"
          y="14"
          textAnchor="middle"
          fill={ink}
          fontSize="52"
          fontWeight="700"
          fontFamily="var(--font-display), sans-serif"
          letterSpacing="-1"
        >
          NS
        </text>
      </g>
    </svg>
  );

  if (variant === "mark") return mark;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">{mark}</div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg tracking-wide sm:text-xl">EL NUEVO SÁNCHEZ</span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Especialista en Jeans
        </span>
      </div>
    </div>
  );
}
