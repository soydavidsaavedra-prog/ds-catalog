import Link from "next/link";
import type { Category } from "@/lib/types/catalog";
import { NSMedia } from "@/components/ui/NSMedia";

export function NSCategoryHero({
  category,
  tenantSlug,
  brandName,
}: {
  category: Category;
  tenantSlug: string;
  brandName?: string;
}) {
  return (
    <div className="relative flex h-64 items-end overflow-hidden bg-ink-950 text-ink-0 sm:h-80">
      <NSMedia
        src={category.image}
        alt={category.name}
        className="absolute inset-0"
        priority
        objectFitMobile="contain"
        brandName={brandName}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {/* Fixed ink-300/ink-0 pair (not text-muted-foreground) — this hero is
            always dark regardless of the site's light/dark state, same
            reasoning as .ds-landing-dark in app/globals.css. */}
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink-300">
          <Link href={`/${tenantSlug}`} className="hover:text-ink-0">Inicio</Link>
          <span>/</span>
          <span className="text-ink-0">{category.name}</span>
        </nav>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Colección</p>
        <h1 className="font-display text-4xl uppercase tracking-wide sm:text-6xl">{category.name}</h1>
        {category.description ? (
          <p className="mt-2 max-w-md text-sm text-ink-200">{category.description}</p>
        ) : null}
      </div>
    </div>
  );
}
