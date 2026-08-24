"use client";

import { useActionState } from "react";
import type { Category, Product } from "@/lib/types/catalog";
import type { ActionState } from "@/app/admin/actions";
import { NSInput, NSLabel, NSSelect, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSImageUploader } from "@/components/admin/NSImageUploader";
import { NSVariantListEditor } from "@/components/admin/NSVariantListEditor";

const initialState: ActionState = {};

export function NSProductForm({
  action,
  categories,
  product,
  submitLabel = "Guardar producto",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Category[];
  product?: Product;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2">
        <div>
          <NSLabel htmlFor="name">Nombre</NSLabel>
          <NSInput id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <NSLabel htmlFor="reference">Referencia</NSLabel>
          <NSInput id="reference" name="reference" defaultValue={product?.reference} placeholder="NS-001" required />
        </div>
        <div>
          <NSLabel htmlFor="slug">Slug (URL)</NSLabel>
          <NSInput id="slug" name="slug" defaultValue={product?.slug} placeholder="Se genera automáticamente si se deja vacío" />
        </div>
        <div>
          <NSLabel htmlFor="categorySlug">Categoría</NSLabel>
          <NSSelect id="categorySlug" name="categorySlug" defaultValue={product?.categorySlug} required>
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </NSSelect>
        </div>
        <div>
          <NSLabel htmlFor="price">Precio detal (USD)</NSLabel>
          <NSInput id="price" name="price" type="number" min="0" step="0.01" defaultValue={product?.price} required />
        </div>
        <div>
          <NSLabel htmlFor="wholesalePrice">Precio mayorista (USD, interno)</NSLabel>
          <NSInput id="wholesalePrice" name="wholesalePrice" type="number" min="0" step="0.01" defaultValue={product?.wholesalePrice ?? ""} />
        </div>
        <div>
          <NSLabel htmlFor="audience">Audiencia</NSLabel>
          <NSSelect id="audience" name="audience" defaultValue={product?.audience ?? "unisex"}>
            <option value="dama">Dama</option>
            <option value="caballero">Caballero</option>
            <option value="nino">Niños</option>
            <option value="unisex">Unisex</option>
          </NSSelect>
        </div>
        <div>
          <NSLabel htmlFor="availability">Disponibilidad</NSLabel>
          <NSSelect id="availability" name="availability" defaultValue={product?.availability ?? "in_stock"}>
            <option value="in_stock">Disponible</option>
            <option value="low_stock">Pocas unidades</option>
            <option value="out_of_stock">Agotado</option>
          </NSSelect>
        </div>
      </section>

      <section>
        <NSLabel htmlFor="description">Descripción</NSLabel>
        <NSTextarea id="description" name="description" defaultValue={product?.description} rows={4} />
      </section>

      <section>
        <NSLabel htmlFor="sizes">Tallas (separadas por coma)</NSLabel>
        <NSInput id="sizes" name="sizes" defaultValue={product?.sizes.join(", ")} placeholder="6, 8, 10, 12, 14" />
      </section>

      <section>
        <NSLabel>Colores</NSLabel>
        <NSVariantListEditor name="colors" initialColors={product?.colors ?? []} />
      </section>

      <section>
        <NSLabel>Imágenes</NSLabel>
        <NSImageUploader name="images" initialImages={product?.images ?? []} />
      </section>

      <section className="flex flex-wrap gap-6">
        {[
          { name: "featured", label: "Destacado", defaultChecked: product?.featured },
          { name: "isNew", label: "Nuevo", defaultChecked: product?.isNew },
          { name: "onSale", label: "En oferta", defaultChecked: product?.onSale },
          { name: "active", label: "Activo (visible en la tienda)", defaultChecked: product?.active ?? true },
        ].map((flag) => (
          <label key={flag.name} className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name={flag.name} defaultChecked={flag.defaultChecked} className="h-4 w-4 rounded border-border-strong accent-[var(--color-gold-400)]" />
            {flag.label}
          </label>
        ))}
      </section>

      <div className="flex gap-3">
        <NSButton type="submit" loading={pending}>
          {submitLabel}
        </NSButton>
      </div>
    </form>
  );
}
