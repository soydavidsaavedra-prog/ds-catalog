import { listCategories, buildCategoryTree } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { siteConfig } from "@/lib/config/site";
import { NSHeaderClient } from "@/components/layout/NSHeaderClient";

export async function NSHeader() {
  const [categories, settings] = await Promise.all([
    listCategories({ activeOnly: true }),
    getSettings(),
  ]);
  const tree = buildCategoryTree(categories);

  return (
    <NSHeaderClient
      parents={tree.map((parent) => ({
        slug: parent.slug,
        name: parent.name,
        children: parent.children.map((c) => ({ slug: c.slug, name: c.name })),
      }))}
      whatsappNumber={siteConfig.contact.whatsappNumber}
      logoSrc={settings.brandLogo}
    />
  );
}
