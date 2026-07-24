import Link from "next/link";

import DSButton from "@/components/ui/DSButton";
import DSProductsTable from "@/components/admin/products/DSProductsTable";
import DSAdminHeader from "@/components/admin/layout/DSAdminHeader";

export default async function ProductsPage() {
  return (
    <div className="space-y-8">
      <DSAdminHeader
        title="Productos"
        subtitle="Administra el catálogo."
      >
        <Link href="/admin/products/new">
          <DSButton>
            + Nuevo producto
          </DSButton>
        </Link>
      </DSAdminHeader>

      <DSProductsTable />
    </div>
  );
}