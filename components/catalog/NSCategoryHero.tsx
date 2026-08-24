import type { Category } from "@/lib/types/catalog";
import { NSMedia } from "@/components/ui/NSMedia";

export function NSCategoryHero({ category }: { category: Category }) {
  return (
    <div className="relative flex h-64 items-end overflow-hidden bg-ink-950 text-ink-0 sm:h-80">
      <NSMedia src={category.image} alt={category.name} className="absolute inset-0" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Colección</p>
        <h1 className="font-display text-4xl uppercase tracking-wide sm:text-6xl">{category.name}</h1>
        {category.description ? (
          <p className="mt-2 max-w-md text-sm text-ink-200">{category.description}</p>
        ) : null}
      </div>
    </div>
  );
}
