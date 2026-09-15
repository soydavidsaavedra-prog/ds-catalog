import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { buildCatalogPdf } from "@/lib/catalog-pdf/build-catalog-pdf";
import { selectProductsForExport, type CatalogExportScope } from "@/lib/catalog-pdf/export-scope";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";

const SCOPES: CatalogExportScope[] = ["all", "category", "selection"];

/**
 * A plain HTML form POST (see NSExportCatalogForm) — the browser downloads
 * whatever this returns via Content-Disposition just like it would for a
 * GET, no client-side JS needed to trigger the save. POST (not GET) so a
 * large manual selection's product ids travel as form fields instead of a
 * URL that could hit browser/server length limits.
 */
export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  if (!(await isAdminAuthenticated(tenantSlug))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tenant = await resolveTenant(tenantSlug);
  const formData = await request.formData();
  const rawScope = formData.get("scope")?.toString();
  const scope: CatalogExportScope = SCOPES.includes(rawScope as CatalogExportScope) ? (rawScope as CatalogExportScope) : "all";
  const categorySlug = formData.get("category")?.toString() || null;
  const productIds = formData.getAll("ids").map((value) => value.toString());

  const [allProducts, categories, settings] = await Promise.all([
    listProducts(tenant.id),
    listCategories(tenant.id),
    getSettings(tenant.id),
  ]);

  const products = selectProductsForExport(allProducts, { scope, categorySlug, productIds });
  const pdf = await buildCatalogPdf({ settings, categories, products });
  const filenameSlug = tenantSlug.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="catalogo-${filenameSlug}.pdf"`,
    },
  });
}
