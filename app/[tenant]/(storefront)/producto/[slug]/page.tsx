import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveTenant, listActiveTenants } from "@/lib/tenant/resolve-tenant";
import {
  getProductBySlug,
  getRelatedProducts,
  listProducts,
} from "@/lib/repositories/product-repository";
import { getCategoryBySlug } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { resolveTheme } from "@/lib/themes/registry";
import { absoluteUrl, formatPrice } from "@/lib/utils/format";

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
  const theme = resolveTheme(tenant.theme);

  return (
    <theme.ProductDetail
      tenantSlug={tenantSlug}
      product={product}
      category={category}
      related={related}
      settings={settings}
    />
  );
}
