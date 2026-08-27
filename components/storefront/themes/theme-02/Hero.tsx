import { NSMedia } from "@/components/ui/NSMedia";
import { NSButton } from "@/components/ui/NSButton";

export interface Theme02HeroProps {
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imagePositionX?: number;
  imagePositionY?: number;
  brandName?: string;
}

/**
 * Theme 02's hero — an inset, rounded photo card (not full-bleed), text
 * overlaid on its own gradient. Pulled out of Home.tsx into its own file so
 * the admin's Hero editor (see components/admin/NSHeroEditorForm.tsx) can
 * preview it directly instead of always showing Theme 01's NSHero — the
 * two themes render the same settings very differently (casing, font,
 * layout), so a theme-blind preview was showing tenants a title/appearance
 * that didn't match what their actual Theme 02 storefront renders.
 */
export function Hero({
  eyebrow,
  titleLine1,
  titleLine2,
  subtitle,
  ctaLabel,
  ctaHref = "/catalogo",
  image,
  imagePositionX = 50,
  imagePositionY = 50,
  brandName,
}: Theme02HeroProps) {
  return (
    <div className="relative flex min-h-[440px] items-end overflow-hidden rounded-3xl border border-border bg-surface sm:min-h-[560px] sm:items-center">
      <div className="absolute inset-0">
        <NSMedia
          src={image}
          alt={`${titleLine1 ?? ""} ${titleLine2 ?? ""}`}
          priority
          className="h-full w-full"
          objectPosition={`${imagePositionX}% ${imagePositionY}%`}
          brandName={brandName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent sm:bg-gradient-to-r sm:from-background sm:via-background/75 sm:to-transparent" />
      </div>

      <div className="relative z-10 max-w-xl p-6 sm:p-12 lg:p-16">
        {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p> : null}
        <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-6xl">
          <span className="block">{titleLine1}</span>
          <span className="block text-accent">{titleLine2}</span>
        </h1>
        {subtitle ? <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p> : null}
        <div className="mt-7 flex flex-wrap gap-3">
          <NSButton href={ctaHref} size="lg">
            {ctaLabel || "Ver productos"}
          </NSButton>
          <NSButton href="#categorias" variant="outline" size="lg">
            Ver categorías
          </NSButton>
        </div>
      </div>
    </div>
  );
}
