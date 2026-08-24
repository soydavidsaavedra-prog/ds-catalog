import { listCategories } from "@/lib/repositories/category-repository";
import { getNextReference } from "@/lib/repositories/product-repository";
import { NSProductForm } from "@/components/admin/NSProductForm";
import { createProductAction } from "@/app/admin/actions";

export default async function AdminNewProductPage() {
  const [categories, nextReference] = await Promise.all([listCategories(), getNextReference()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Nuevo producto</h1>
        <p className="mt-1 text-sm text-muted-foreground">Completa los datos para publicarlo en el catálogo.</p>
      </div>
      <div className="max-w-2xl rounded-card border border-border bg-surface-elevated p-6">
        <NSProductForm
          action={createProductAction}
          categories={categories}
          nextReference={nextReference}
          submitLabel="Crear producto"
        />
      </div>
    </div>
  );
}
