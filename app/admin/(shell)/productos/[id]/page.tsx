import { notFound } from "next/navigation";
import { getProductById } from "@/lib/repositories/product-repository";
import { listCategories } from "@/lib/repositories/category-repository";
import { NSProductForm } from "@/components/admin/NSProductForm";
import { updateProductAction } from "@/app/admin/actions";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), listCategories()]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Editar producto</h1>
        <p className="mt-1 text-sm text-muted-foreground">{product.reference} — {product.name}</p>
      </div>
      <div className="max-w-2xl rounded-card border border-border bg-surface-elevated p-6">
        <NSProductForm action={action} categories={categories} product={product} submitLabel="Guardar cambios" />
      </div>
    </div>
  );
}
