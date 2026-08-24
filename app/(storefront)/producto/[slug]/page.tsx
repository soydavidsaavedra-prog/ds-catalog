import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  listProducts,
} from "@/lib/repositories/product-repository";
import { getCategoryBySlug } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { siteConfig } from "@/lib/config/site";
import { absoluteUrl, formatPrice } from "@/lib/utils/format";
import { NSProductGallery } from "@/components/product/NSProductGallery";
import { NSProductPurchasePanel } from "@/components/product/NSProductPurchasePanel";
import { NSRelatedProducts } from "@/components/product/NSRelatedProducts";

export async function generateStaticParams() {
  const products = await listProducts({ activeOnly: true });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) return {};

  const title = `${product.name} — ${product.reference}`;
  const description = `${product.description} Precio: ${formatPrice(product.price)}.`;
  const url = absoluteUrl(`/producto/${product.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.brand.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const [related, category, settings] = await Promise.all([
    getRelatedProducts(product),
    getCategoryBySlug(product.categorySlug),
    getSettings(),
  ]);
  const paymentBadge = { icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-foreground">Catálogo</Link>
          {category ? (
            <>
              <span>/</span>
              <Link href={`/${category.slug}`} className="hover:text-foreground">{category.name}</Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <NSProductGallery images={product.images} reference={product.reference} name={product.name} />
          <NSProductPurchasePanel product={product} paymentBadge={paymentBadge} />
        </div>
      </div>

      <NSRelatedProducts products={related} paymentBadge={paymentBadge} />
    </div>
  );
}
