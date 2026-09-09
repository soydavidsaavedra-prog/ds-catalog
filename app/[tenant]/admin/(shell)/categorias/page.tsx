import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories, buildCategoryTree } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getBusinessTypeProfile } from "@/lib/tenant/business-type";
import { createCategoryAction } from "@/app/[tenant]/admin/actions";
import { NSCategoryManager } from "@/components/admin/NSCategoryManager";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [categories, products] = await Promise.all([listCategories(tenant.id), listProducts(tenant.id)]);
  const tree = buildCategoryTree(categories);
  const parents = categories.filter((c) => c.parentId === null);
  const createAction = createCategoryAction.bind(null, tenant.id, tenantSlug);
  const { exampleParentCategory, exampleChildCategory } = getBusinessTypeProfile(tenant.businessType);

  const productCountBySlug: Record<string, number> = {};
  for (const product of products) {
    productCountBySlug[product.categorySlug] = (productCountBySlug[product.categorySlug] ?? 0) + 1;
  }

  return (
    <NSCategoryManager
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      tree={tree}
      parents={parents}
      productCountBySlug={productCountBySlug}
      createAction={createAction}
      exampleParentCategory={exampleParentCategory}
      exampleChildCategory={exampleChildCategory}
    />
  );
}
