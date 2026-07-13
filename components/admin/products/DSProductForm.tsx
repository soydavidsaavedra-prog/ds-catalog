"use client";

import { useState } from "react";

import type { Product } from "@/types/product";

import DSButton from "@/components/ui/DSButton";
import DSCard from "@/components/ui/DSCard";
import DSInput from "@/components/ui/DSInput";

type Props = {
  product?: Product;
};

export default function DSProductForm({
  product,
}: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log({
      id: product?.id,
      name,
      brand,
      category,
      price,
      stock,
    });
  }

  return (
    <DSCard>
      <form
        onSubmit={handleSubmit}
        className="grid gap-6"
      >
        <DSInput
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <DSInput
          label="Marca"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />

        <DSInput
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-6">
          <DSInput
            label="Precio"
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(Number(e.target.value))
            }
          />

          <DSInput
            label="Stock"
            type="number"
            value={stock}
            onChange={(e) =>
              setStock(Number(e.target.value))
            }
          />
        </div>

        <DSButton type="submit">
          Guardar producto
        </DSButton>
      </form>
    </DSCard>
  );
}