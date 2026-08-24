import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenant, listActiveTenants } from "@/lib/tenant/resolve-tenant";
import {
  getProductBySlug,
  getRelatedProducts,
  listProducts,
} from "@/lib/repositories/product-repository";
import { getCategoryBySlug } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { absoluteUrl, formatPrice } from "@/lib/utils/format";
import { NSProductGallery } from "@/components/product/NSProductGallery";
import { NSProductPurchasePanel } from "@/components/product/NSProductPurchasePanel";
import { NSRelatedProducts } from "@/components/product/NSRelatedProducts";

export async function generateStaticParams() {
  const tenants = await listActiveTenants();
  const params: { tenant: string; slug: string }[] = [];
  for (const tenant of tenants) {
    const products = await listProducts(tenant.id, { activeOnly: true });
    for (const product of products) {
      params.push({ tenant: tenant.slug, slug: product.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [product, settings] = await Promise.all([
    getProductBySlug(tenant.id, slug),
    getSettings(tenant.id),
  ]);
  if (!product || !product.active) return {};

  const title = `${product.name} — ${product.reference}`;
  const description = `${product.description} Precio: ${formatPrice(product.price)}.`;
  const url = absoluteUrl(`/${tenantSlug}/producto/${product.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: settings.brandName,
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
  params: Promise<{ tenant: string; slug: string }>;
}) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const product = await getProductBySlug(tenant.id, slug);
  if (!product || !product.active) notFound();

  const [related, category, settings] = await Promise.all([
    getRelatedProducts(tenant.id, product),
    getCategoryBySlug(tenant.id, product.categorySlug),
    getSettings(tenant.id),
  ]);
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
          <NSProductGallery images={product.images} reference={product.reference} name={product.name} />
          <NSProductPurchasePanel tenantSlug={tenantSlug} product={product} paymentBadge={paymentBadge} />
        </div>
      </div>

      <NSRelatedProducts tenantSlug={tenantSlug} products={related} paymentBadge={paymentBadge} />
    </div>
  );
}
