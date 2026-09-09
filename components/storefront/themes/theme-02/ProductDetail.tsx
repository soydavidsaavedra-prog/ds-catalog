import Link from "next/link";
import type { ThemeProductDetailProps } from "@/lib/themes/types";
import { NSProductGallery } from "@/components/storefront/themes/theme-01/NSProductGallery";
import { NSProductPurchasePanel } from "@/components/storefront/themes/theme-01/NSProductPurchasePanel";
import { availabilityLabel } from "@/lib/utils/format";
import { ProductGrid } from "./ProductGrid";

const TRUST_ITEMS = [
  { title: "Paga seguro", description: "Múltiples métodos de pago" },
  { title: "Envíos a nivel nacional", description: "Llegamos a donde nos necesites" },
  { title: "Asesoría experta", description: "Te ayudamos a tomar la mejor decisión" },
  { title: "Garantía total", description: "Respaldo en todos nuestros productos" },
];

/**
 * Theme 02's product detail — editorial gallery + purchase panel
 * split, matching the reference's composition. The gallery and purchase
 * panel themselves are reused directly from Theme 01 (see the imports
 * above): both are already fully token-driven with no Theme-01-specific
 * branding baked in, so they render correctly under the .theme-02
 * scope with zero changes — genuine cross-theme reuse, not a shortcut.
 */
export function ProductDetail({ tenantSlug, product, category, related, settings }: ThemeProductDetailProps) {
  const paymentBadge = { icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel };
  const base = `/${tenantSlug}`;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={base} className="hover:text-foreground">Inicio</Link>
          <span>/</span>
          <Link href={`${base}/catalogo`} className="hover:text-foreground">Productos</Link>
          {category ? (
            <>
              <span>/</span>
              <Link href={`${base}/${category.slug}`} className="hover:text-foreground">{category.name}</Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <NSProductGallery
              images={product.images}
              reference={product.reference}
              name={product.name}
              brandName={settings.brandName}
              cardAspectRatio={product.cardAspectRatio}
              imageFit={product.imageFit}
            />

            {/* Ficha rápida — real product data only (reference/category/availability), presented as bordered spec cells. */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border">
              <SpecCell icon={<TagIcon />} label="Referencia" value={product.reference} />
              <SpecCell icon={<FolderIcon />} label="Categoría" value={category?.name ?? "General"} />
              <SpecCell icon={<CheckIcon />} label="Disponibilidad" value={availabilityLabel[product.availability]} />
            </div>
          </div>

          <NSProductPurchasePanel tenantSlug={tenantSlug} product={product} paymentBadge={paymentBadge} />
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-border bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Combina con</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">También te puede interesar</h2>
            <div className="mt-8">
              <ProductGrid tenantSlug={tenantSlug} products={related} paymentBadge={paymentBadge} brandName={settings.brandName} />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SpecCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-surface px-3.5 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-foreground">{value}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 8.5 9.5 1.5H16a1.5 1.5 0 0 1 1.5 1.5v6.5L10.5 17a1.5 1.5 0 0 1-2.1 0L2.5 11a1.5 1.5 0 0 1 0-2.5Z" />
      <circle cx="12.5" cy="6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 5.5A1.5 1.5 0 0 1 4 4h3.6l1.4 2h7a1.5 1.5 0 0 1 1.5 1.5v6.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-8Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6.8 10 2.2 2.2 4.2-4.4" />
    </svg>
  );
}
