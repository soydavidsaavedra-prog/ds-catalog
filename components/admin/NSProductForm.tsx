"use client";

import { useActionState, useState } from "react";
import type { Availability, CardAspectRatio, Category, ImageFit, Product, SiteSettings } from "@/lib/types/catalog";
import type { ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSSelect, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { DSCard } from "@/components/ui/DSCard";
import { NSImageUploader } from "@/components/admin/NSImageUploader";
import { NSVariantListEditor } from "@/components/admin/NSVariantListEditor";
import { NSProductCardPreview } from "@/components/admin/NSProductCardPreview";
import { buildAccentOverrideVars } from "@/lib/utils/brand";
import { availabilityLabel } from "@/lib/utils/format";
import { deriveAvailabilityFromStock } from "@/lib/products/stock";

const initialState: ActionState = {};

const CARD_ASPECT_RATIO_OPTIONS: { value: CardAspectRatio; label: string }[] = [
  { value: "portrait", label: "Retrato (4:5) — el clásico, para fotos más altas que anchas" },
  { value: "square", label: "Cuadrado (1:1)" },
  { value: "landscape", label: "Horizontal (4:3) — para fotos más anchas que altas" },
];

export function NSProductForm({
  tenantSlug,
  action,
  categories,
  product,
  nextReference,
  submitLabel = "Guardar producto",
  showSizes = true,
  showColors = true,
  settings,
}: {
  tenantSlug: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Category[];
  product?: Product;
  nextReference?: string;
  submitLabel?: string;
  /** Driven by the tenant's business type (lib/tenant/business-type.ts) — a ferretería/restaurante has no use for either. */
  showSizes?: boolean;
  showColors?: boolean;
  /** For the live preview only — same brand/payment-badge data NSProductCard reads on the real storefront. */
  settings: SiteSettings;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  // Controlled just enough to drive the live preview — everything else on
  // this form (reference, slug, category, description, sizes, colors...)
  // stays uncontrolled/defaultValue, unchanged from before.
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [previousPrice, setPreviousPrice] = useState(product?.previousPrice ?? null);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [onSale, setOnSale] = useState(product?.onSale ?? false);
  const [hidePaymentBadge, setHidePaymentBadge] = useState(product?.hidePaymentBadge ?? false);
  const [availability, setAvailability] = useState<Availability>(product?.availability ?? "in_stock");
  const [stock, setStock] = useState<number | null>(product?.stock ?? null);
  const effectiveAvailability = stock !== null ? deriveAvailabilityFromStock(stock) : availability;
  const [cardAspectRatio, setCardAspectRatio] = useState<CardAspectRatio>(product?.cardAspectRatio ?? "portrait");
  const [imageFit, setImageFit] = useState<ImageFit>(product?.imageFit ?? "cover");
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  return (
    <div className="grid max-w-6xl gap-8 xl:grid-cols-[1fr_320px] xl:items-start">
      <form action={formAction} className="flex flex-col gap-6">
        {state.error ? (
          <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
            {state.error}
          </div>
        ) : null}

        <DSCard title="Información principal">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <NSLabel htmlFor="name">Nombre</NSLabel>
              <NSInput id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <NSLabel htmlFor="reference">Referencia</NSLabel>
              <NSInput
                id="reference"
                name="reference"
                defaultValue={product?.reference ?? nextReference}
                placeholder="REF-001"
                required
              />
              {!product ? (
                <p className="mt-1 text-xs text-muted-foreground">Generada automáticamente — puedes cambiarla.</p>
              ) : null}
            </div>
            <div>
              <NSLabel htmlFor="slug">Slug (URL)</NSLabel>
              <NSInput id="slug" name="slug" defaultValue={product?.slug} placeholder="Se genera automáticamente si se deja vacío" />
            </div>
            <div>
              <NSLabel htmlFor="categorySlug">Categoría</NSLabel>
              <NSSelect id="categorySlug" name="categorySlug" defaultValue={product?.categorySlug} required>
                <option value="" disabled>Selecciona una categoría</option>
                {categories
                  .filter((c) => c.parentId === null)
                  .map((parent) => {
                    const children = categories.filter((c) => c.parentId === parent.id);
                    if (children.length === 0) {
                      return (
                        <option key={parent.slug} value={parent.slug}>
                          {parent.name}
                        </option>
                      );
                    }
                    return (
                      <optgroup key={parent.id} label={parent.name}>
                        {children.map((child) => (
                          <option key={child.slug} value={child.slug}>
                            {child.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
              </NSSelect>
            </div>
          </div>
        </DSCard>

        <DSCard title="Precio y disponibilidad">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <NSLabel htmlFor="price">Precio detal (USD)</NSLabel>
              <NSInput
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <NSLabel htmlFor="previousPrice">Precio anterior (opcional)</NSLabel>
              <NSInput
                id="previousPrice"
                name="previousPrice"
                type="number"
                min="0"
                step="0.01"
                value={previousPrice ?? ""}
                onChange={(e) => setPreviousPrice(e.target.value === "" ? null : Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ponlo solo si está en oferta: si es mayor al precio detal, sale tachado junto al precio nuevo.
              </p>
            </div>
            <div>
              <NSLabel htmlFor="stock">Stock (opcional)</NSLabel>
              <NSInput
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={stock ?? ""}
                onChange={(e) => setStock(e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value))))}
                placeholder="Sin control de inventario"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ponle una cantidad para llevar inventario real: la disponibilidad se calcula sola a partir de ella y
                baja con cada pedido enviado por WhatsApp. Déjalo vacío para seguir eligiendo la disponibilidad a mano.
              </p>
            </div>
            <div>
              <NSLabel htmlFor="availability">Disponibilidad</NSLabel>
              {stock !== null ? (
                <>
                  <input type="hidden" name="availability" value={effectiveAvailability} />
                  <div className="flex h-11 items-center rounded-control border border-border bg-surface px-3.5 text-sm text-muted-foreground">
                    {availabilityLabel[effectiveAvailability]}
                    <span className="ml-1.5 text-xs">(según el stock)</span>
                  </div>
                </>
              ) : (
                <NSSelect
                  id="availability"
                  name="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as Availability)}
                >
                  <option value="in_stock">Disponible</option>
                  <option value="low_stock">Pocas unidades</option>
                  <option value="out_of_stock">Agotado</option>
                </NSSelect>
              )}
            </div>
          </div>
        </DSCard>

        <DSCard title="Descripción">
          <NSTextarea id="description" name="description" defaultValue={product?.description} rows={4} />
        </DSCard>

        {showSizes || showColors ? (
          <DSCard title="Variantes">
            <div className="flex flex-col gap-5">
              {showSizes ? (
                <div>
                  <NSLabel htmlFor="sizes">Tallas (separadas por coma)</NSLabel>
                  <NSInput id="sizes" name="sizes" defaultValue={product?.sizes.join(", ")} placeholder="6, 8, 10, 12, 14" />
                </div>
              ) : null}
              {showColors ? (
                <div>
                  <NSLabel>Colores</NSLabel>
                  <NSVariantListEditor name="colors" initialColors={product?.colors ?? []} />
                </div>
              ) : null}
            </div>
          </DSCard>
        ) : null}

        <DSCard title="Media" description="Fotos del producto y cómo se recortan en la tarjeta del catálogo.">
          <div className="flex flex-col gap-5">
            <div>
              <NSLabel>Imágenes</NSLabel>
              <NSImageUploader tenantSlug={tenantSlug} name="images" initialImages={product?.images ?? []} onChange={setImages} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <NSLabel htmlFor="cardAspectRatio">Forma de la tarjeta</NSLabel>
                <NSSelect
                  id="cardAspectRatio"
                  name="cardAspectRatio"
                  value={cardAspectRatio}
                  onChange={(e) => setCardAspectRatio(e.target.value as CardAspectRatio)}
                >
                  {CARD_ASPECT_RATIO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </NSSelect>
              </div>
              <div>
                <NSLabel htmlFor="imageFit">Ajuste de imagen</NSLabel>
                <NSSelect id="imageFit" name="imageFit" value={imageFit} onChange={(e) => setImageFit(e.target.value as ImageFit)}>
                  <option value="cover">Recortar para llenar el marco</option>
                  <option value="contain">Mostrar completa, sin recortar</option>
                </NSSelect>
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Elige la forma que mejor le quede a tu foto y si prefieres verla completa (con un margen neutro) o
              recortada para llenar el espacio. Mira el resultado en la vista previa.
            </p>
          </div>
        </DSCard>

        <DSCard title="Visibilidad" description="Estado del producto y las etiquetas que se muestran sobre su foto en el catálogo.">
          <div className="flex flex-col gap-5">
            <label className="flex items-start gap-3 rounded-control border border-border bg-surface px-4 py-3 has-[:checked]:border-accent-strong has-[:checked]:bg-accent/5">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product?.active ?? true}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong accent-[var(--accent)]"
              />
              <span>
                <span className="text-sm font-medium">Activo</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Visible para tus clientes en el catálogo público. Desmárcalo para ocultarlo sin borrarlo.
                </span>
              </span>
            </label>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Etiquetas de la tarjeta</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm font-medium has-[:checked]:border-accent-strong has-[:checked]:bg-accent/5">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={product?.featured}
                    className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
                  />
                  Destacado
                </label>
                <label className="flex items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm font-medium has-[:checked]:border-accent-strong has-[:checked]:bg-accent/5">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
                  />
                  Nuevo
                </label>
                <label className="flex items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm font-medium has-[:checked]:border-accent-strong has-[:checked]:bg-accent/5">
                  <input
                    type="checkbox"
                    name="onSale"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
                  />
                  En oferta
                </label>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-control border border-border bg-surface px-4 py-3 has-[:checked]:border-accent-strong has-[:checked]:bg-accent/5">
              <input
                type="checkbox"
                name="hidePaymentBadge"
                checked={hidePaymentBadge}
                onChange={(e) => setHidePaymentBadge(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong accent-[var(--accent)]"
              />
              <span>
                <span className="text-sm font-medium">Ocultar ícono de método de pago</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Oculta el ícono (ej. Cashea) que normalmente aparece sobre la foto de este producto.
                </span>
              </span>
            </label>
          </div>
        </DSCard>

        <div className="sticky bottom-0 -mx-1 flex items-center gap-3 border-t border-border bg-surface/95 px-1 py-4 backdrop-blur">
          <NSButton type="submit" loading={pending}>
            {submitLabel}
          </NSButton>
          <NSButton href={`/${tenantSlug}/admin/productos`} variant="outline">
            Cancelar
          </NSButton>
        </div>
      </form>

      <div className="xl:sticky xl:top-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Así se ve en el catálogo
        </p>
        {/* tenant-preview: real brand accent/light look, not DS Catalog's platform chrome — see app/globals.css and Fase 1. */}
        <div
          className="tenant-preview w-full max-w-[280px] rounded-card border border-border bg-surface-elevated p-4"
          style={buildAccentOverrideVars(settings)}
        >
          <NSProductCardPreview
            imageSrc={images[0]}
            name={name}
            reference={product?.reference ?? nextReference ?? ""}
            price={price}
            previousPrice={previousPrice}
            isNew={isNew}
            onSale={onSale}
            outOfStock={effectiveAvailability === "out_of_stock"}
            hidePaymentBadge={hidePaymentBadge}
            paymentBadge={{ icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel }}
            cardAspectRatio={cardAspectRatio}
            imageFit={imageFit}
            brandName={settings.brandName}
          />
        </div>
      </div>
    </div>
  );
}
