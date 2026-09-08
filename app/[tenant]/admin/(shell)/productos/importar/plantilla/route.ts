import { NextResponse } from "next/server";
import { buildProductImportTemplateCsv } from "@/lib/products/csv-import";

/** Not tenant-specific (the template's one example row is generic), but lives under the tenant path since it's only ever linked from that tenant's own /admin/productos/importar page. */
export async function GET() {
  return new NextResponse(buildProductImportTemplateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="plantilla-productos.csv"',
    },
  });
}
