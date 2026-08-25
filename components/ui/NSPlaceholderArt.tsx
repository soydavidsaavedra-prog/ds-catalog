import { hashSeed, placeholderVariant } from "@/lib/media/placeholder";
import { cn } from "@/lib/utils/cn";

interface NSPlaceholderArtProps {
  category: string;
  seed: string;
  label?: string;
  reference?: string;
  className?: string;
  /** Watermark letters in the middle of the plate — pass the tenant's own initials so this doesn't always read "NS". */
  monogram?: string;
}

export function NSPlaceholderArt({
  category,
  seed,
  label,
  reference,
  className,
  monogram = "NS",
}: NSPlaceholderArtProps) {
  const id = `ns-ph-${category}-${seed}`.replace(/[^a-zA-Z0-9-]/g, "");
  const gradientId = `${id}-grad`;
  const grainId = `${id}-grain`;
  const { from, to } = placeholderVariant(seed);
  const hash = hashSeed(seed);
  const ringRotation = hash % 360;
  const stitchOffset = 22 + (hash % 14);

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={label ?? category}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="400" height="500" fill={`url(#${gradientId})`} />
      <rect width="400" height="500" filter={`url(#${grainId})`} opacity="0.05" />

      <line x1={stitchOffset} y1="0" x2={stitchOffset} y2="500" stroke="#f8c909" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 6" />
      <line x1={400 - stitchOffset} y1="0" x2={400 - stitchOffset} y2="500" stroke="#f8c909" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 6" />

      <g transform={`translate(200 250) rotate(${ringRotation})`} opacity="0.14">
        <circle r="120" fill="none" stroke="#f8c909" strokeWidth="1.5" />
        <circle r="102" fill="none" stroke="#f8c909" strokeWidth="1" />
      </g>
      <text
        x="200"
        y="272"
        textAnchor="middle"
        fill="#f8c909"
        opacity="0.16"
        fontSize="120"
        fontWeight="700"
        fontFamily="var(--font-display), sans-serif"
      >
        {monogram}
      </text>

      <text x="24" y="40" fill="#f8c909" opacity="0.75" fontSize="12" fontWeight="600" letterSpacing="3">
        {category.toUpperCase()}
      </text>
      {reference ? (
        <text
          x="376"
          y="470"
          textAnchor="end"
          fill="#f8c909"
          opacity="0.6"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
          letterSpacing="1"
        >
          {reference}
        </text>
      ) : null}
    </svg>
  );
}
