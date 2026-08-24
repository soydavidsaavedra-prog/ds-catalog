import Link from "next/link";
import type { Category } from "@/lib/types/catalog";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSReveal } from "@/components/ui/NSReveal";

export function NSCollections({
  topLevelCategories,
  subcategories,
}: {
  /** Top-level categories (Dama, Caballero, Niño...) shown as the big entry tiles. */
  topLevelCategories: Category[];
  /** Subcategories (Skinny, Cargo, Jogger...) shown as the smaller chip list below. */
  subcategories: Category[];
}) {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NSSectionHeading eyebrow="Catálogo" title="Explora la colección" />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {topLevelCategories.map((category, index) => (
            <NSReveal key={category.slug} delay={index * 0.1}>
              <Link
                href={`/${category.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-card"
              >
                <div className="absolute inset-0 transition-transform duration-slower ease-out-ns group-hover:scale-105">
                  <NSMedia src={category.image} alt={category.name} className="h-full w-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="font-display text-3xl uppercase tracking-wide text-ink-0">{category.name}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Ver colección
                  </span>
                </div>
              </Link>
            </NSReveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {subcategories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-control px-1 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-pill border border-border-strong transition-colors hover:border-accent-strong sm:h-20 sm:w-20">
                <NSMedia src={category.image} alt={category.name} className="h-full w-full" />
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
