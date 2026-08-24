import Link from "next/link";
import type { Category } from "@/lib/types/catalog";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSPlaceholderArt } from "@/components/ui/NSPlaceholderArt";
import { NSReveal } from "@/components/ui/NSReveal";

const AUDIENCE_TILES = [
  { audience: "dama", label: "Dama", seed: "audience-dama" },
  { audience: "caballero", label: "Caballero", seed: "audience-caballero" },
  { audience: "nino", label: "Niños", seed: "audience-nino" },
] as const;

export function NSCollections({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NSSectionHeading eyebrow="Catálogo" title="Explora la colección" />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {AUDIENCE_TILES.map((tile, index) => (
            <NSReveal key={tile.audience} delay={index * 0.1}>
              <Link
                href={`/catalogo?audience=${tile.audience}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-card"
              >
                <div className="absolute inset-0 transition-transform duration-slower ease-out-ns group-hover:scale-105">
                  <NSPlaceholderArt category={tile.label} seed={tile.seed} label={tile.label} className="h-full w-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="font-display text-3xl uppercase tracking-wide text-ink-0">{tile.label}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Ver colección
                  </span>
                </div>
              </Link>
            </NSReveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-control px-1 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-pill border border-border-strong transition-colors hover:border-accent-strong sm:h-20 sm:w-20">
                <NSPlaceholderArt category={category.slug} seed={`chip-${category.slug}`} label={category.name} className="h-full w-full" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
