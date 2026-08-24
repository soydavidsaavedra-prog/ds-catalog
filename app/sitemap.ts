import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = siteConfig.seo.domain.replace(/\/$/, "");
  const [categories, products] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({ activeOnly: true }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${domain}/`, changeFrequency: "daily", priority: 1 },
    { url: `${domain}/catalogo`, changeFrequency: "daily", priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${domain}/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${domain}/producto/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
