import { cn } from "@/lib/utils/cn";

/**
 * NSLogo — the El Nuevo Sánchez monogram.
 *
 * IMPORTANT: this is a faithful *recreation* of the official mark (circular
 * badge, gold ring, arced "EL NUEVO SÁNCHEZ" / "ESPECIALISTA EN JEANS"
 * wordmarks, NS monogram) built in SVG because the original logo asset
 * ("LOGO EL NUEVO SANCHEZ.JPEG") was shared only as an inline chat image,
 * not as a file this project can read from disk. Drop the real file at
 * public/brand/logo.png (and, ideally, an SVG) and swap the <svg> below for
 * an <Image> pointing at it — do not keep shipping this recreation once the
 * original asset exists.
 */

interface NSLogoProps {
  className?: string;
  /** "mark" = badge only. "full" = badge + wordmark, for wide headers. */
  variant?: "mark" | "full";
  tone?: "gold-on-black" | "black-on-transparent";
  /** Pass a unique value when rendering more than one NSLogo on the same page (e.g. header + footer) so SVG ids don't collide. */
  id?: string;
}

export function NSLogo({
  className,
  variant = "mark",
  tone = "gold-on-black",
  id = "ns-logo",
}: NSLogoProps) {
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
