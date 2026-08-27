import Link from "next/link";
import type { Category, SiteSettings } from "@/lib/types/catalog";
import { NSMedia } from "@/components/ui/NSMedia";

/** Breadcrumb + banner for a category's own page — matches the reference's "PÁGINA DE CATEGORÍA" composition, built from real data only (category.image, no invented photography). */
export function CategoryBanner({ tenantSlug, category, settings }: { tenantSlug: string; category: Category; settings: SiteSettings }) {
  const base = `/${tenantSlug}`;

  return (
    <div className="relative flex h-56 items-end overflow-hidden bg-surface sm:h-72">
      <NSMedia src={category.image} alt={category.name} className="absolute inset-0" priority objectFitMobile="contain" brandName={settings.brandName} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-7 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={base} className="hover:text-foreground">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{category.name}</h1>
        {category.description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{category.description}</p> : null}
      </div>
    </div>
  );
}
