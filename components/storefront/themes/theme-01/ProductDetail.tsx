import Link from "next/link";
import type { ThemeProductDetailProps } from "@/lib/themes/types";
import { NSProductGallery } from "./NSProductGallery";
import { NSProductPurchasePanel } from "./NSProductPurchasePanel";
import { NSRelatedProducts } from "./NSRelatedProducts";

/** Theme 01's product-detail composition — moved here verbatim from app/[tenant]/(storefront)/producto/[slug]/page.tsx. */
export function ProductDetail({ tenantSlug, product, category, related, settings }: ThemeProductDetailProps) {
  const paymentBadge = { icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel };
  const base = `/${tenantSlug}`;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={base} className="hover:text-foreground">Inicio</Link>
          <span>/</span>
          <Link href={`${base}/catalogo`} className="hover:text-foreground">Catálogo</Link>
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
          <NSProductGallery
            images={product.images}
            reference={product.reference}
            name={product.name}
            brandName={settings.brandName}
            cardAspectRatio={product.cardAspectRatio}
            imageFit={product.imageFit}
          />
          <NSProductPurchasePanel tenantSlug={tenantSlug} product={product} paymentBadge={paymentBadge} />
        </div>
      </div>

      <NSRelatedProducts tenantSlug={tenantSlug} products={related} paymentBadge={paymentBadge} brandName={settings.brandName} />
    </div>
  );
}
