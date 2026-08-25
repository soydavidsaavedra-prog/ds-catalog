import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const domain = siteConfig.seo.domain.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Every tenant's admin panel lives at /{tenant}/admin/*.
      disallow: ["/*/admin", "/*/admin/*"],
    },
    sitemap: `${domain}/sitemap.xml`,
  };
}
