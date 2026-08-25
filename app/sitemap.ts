import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { listActiveTenants } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = siteConfig.seo.domain.replace(/\/$/, "");
  const tenants = await listActiveTenants();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${domain}/`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const perTenantRoutes = await Promise.all(
    tenants.map(async (tenant) => {
      const base = `${domain}/${tenant.slug}`;
      const [categories, products] = await Promise.all([
        listCategories(tenant.id, { activeOnly: true }),
        listProducts(tenant.id, { activeOnly: true }),
      ]);

      const tenantRoutes: MetadataRoute.Sitemap = [
        { url: `${base}`, changeFrequency: "daily", priority: 1 },
        { url: `${base}/catalogo`, changeFrequency: "daily", priority: 0.9 },
        ...categories.map((category) => ({
          url: `${base}/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: "daily" as const,
          priority: 0.8,
        })),
        ...products.map((product) => ({
          url: `${base}/producto/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })),
      ];
      return tenantRoutes;
    }),
  );

  return [...staticRoutes, ...perTenantRoutes.flat()];
}
