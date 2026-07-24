"use client";

import Link from "next/link";

import { deleteProduct } from "@/app/actions/product.actions";

import DSButton from "@/components/ui/DSButton";

type Props = {
  id: number;
};

export default function DSProductsActions({
  id,
}: Props) {
  async function handleDelete() {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este producto?"
    );

    if (!confirmed) return;

    await deleteProduct(id);
  }

  return (
    <div className="flex justify-center gap-2">
      <Link href={`/admin/products/${id}/edit`}>
        <DSButton variant="secondary">
          Editar
        </DSButton>
      </Link>

      <DSButton
        variant="outline"
        onClick={handleDelete}
      >
        Eliminar
      </DSButton>
    </div>
  );
}