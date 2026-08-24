import { listCategories } from "@/lib/repositories/category-repository";
import { siteConfig } from "@/lib/config/site";
import { NSHeaderClient } from "@/components/layout/NSHeaderClient";

export async function NSHeader() {
  const categories = await listCategories({ activeOnly: true });

  return (
    <NSHeaderClient
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      whatsappNumber={siteConfig.contact.whatsappNumber}
    />
  );
}
