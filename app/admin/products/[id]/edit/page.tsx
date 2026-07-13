import { notFound } from "next/navigation";

import DSHeading from "@/components/ui/DSHeading";
import DSProductForm from "@/components/admin/products/DSProductForm";

import { catalogEngine } from "@/engines/catalog/catalog.engine";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: Props) {
  const { id } = await params;

  const product = catalogEngine.getProductById(
    Number(id)
  );

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <DSHeading
        title="Editar producto"
        subtitle="Actualiza la información del producto."
      />

      <DSProductForm
        product={product}
      />
    </div>
  );
}