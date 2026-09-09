"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/catalog";
import { NSInput, NSLabel, NSSelect, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSMedia } from "@/components/ui/NSMedia";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";
import {
  deleteCategoryAction,
  moveCategoryAction,
  toggleCategoryActiveAction,
  updateCategoryAction,
} from "@/app/[tenant]/admin/actions";

/**
 * One row of the category collection manager — a compact summary
 * (image, name, slug, parent relation, product count, status) that
 * expands in place into the same edit form as before (name/slug/parent/
 * description/image), instead of every category's full form being open
 * at once. Move up/down, activate/deactivate, and delete are the exact
 * same server actions as before — only the presentation changed.
 */
export function NSCategoryRow({
  tenantId,
  tenantSlug,
  category,
  parents,
  parentName,
  productCount,
  isFirst,
  isLast,
}: {
  tenantId: string;
  tenantSlug: string;
  category: Category;
  parents: Category[];
  /** Name of the parent category, when this row is a subcategory — undefined for a top-level category. */
  parentName?: string;
  productCount: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-card border border-border bg-surface-elevated">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-control bg-surface">
          <NSMedia src={category.image} alt={category.name} sizes="48px" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
            <DSStatusBadge label={`${productCount} producto${productCount === 1 ? "" : "s"}`} tone="accent" />
            <DSStatusBadge label={category.active ? "Activo" : "Inactivo"} tone={category.active ? "success" : "muted"} />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            /{category.slug}
            {parentName ? ` · subcategoría de ${parentName}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <form action={moveCategoryAction.bind(null, tenantId, tenantSlug, category.id, "up")}>
            <button
              type="submit"
              disabled={isFirst}
              title="Subir"
              aria-label="Subir"
              className="flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
          </form>
          <form action={moveCategoryAction.bind(null, tenantId, tenantSlug, category.id, "down")}>
            <button
              type="submit"
              disabled={isLast}
              title="Bajar"
              aria-label="Bajar"
              className="flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Cerrar edición" : "Editar"}
            aria-label={expanded ? "Cerrar edición" : "Editar"}
            className="flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface hover:text-accent-strong"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <NSAdminDeleteButton
            action={deleteCategoryAction.bind(null, tenantId, tenantSlug, category.id)}
            confirmMessage={`¿Eliminar la categoría "${category.name}"? Los productos existentes conservarán la categoría, pero la página /${category.slug} dejará de estar disponible.`}
          />
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-border p-4">
          <form action={updateCategoryAction.bind(null, tenantId, tenantSlug, category.id)} className="flex flex-col gap-5">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Información</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <NSLabel htmlFor={`name-${category.id}`}>Nombre</NSLabel>
                  <NSInput id={`name-${category.id}`} name="name" defaultValue={category.name} required />
                </div>
                <div>
                  <NSLabel htmlFor={`slug-${category.id}`}>Slug</NSLabel>
                  <NSInput id={`slug-${category.id}`} name="slug" defaultValue={category.slug} required />
                </div>
              </div>
              <div className="mt-4">
                <NSLabel htmlFor={`desc-${category.id}`}>Descripción</NSLabel>
                <NSTextarea id={`desc-${category.id}`} name="description" defaultValue={category.description} rows={2} />
              </div>
              <div className="mt-4">
                <NSLabel>Foto de la categoría</NSLabel>
                <NSSingleImageUploader tenantSlug={tenantSlug} name="image" initialValue={category.image} label="Subir foto" />
              </div>
            </div>

            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Jerarquía</p>
              <NSLabel htmlFor={`parent-${category.id}`}>Categoría padre</NSLabel>
              <NSSelect id={`parent-${category.id}`} name="parentId" defaultValue={category.parentId ?? ""}>
                <option value="">Ninguna (categoría principal)</option>
                {parents
                  .filter((p) => p.id !== category.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </NSSelect>
            </div>

            <div>
              <NSButton type="submit" variant="outline" size="sm">
                Guardar cambios
              </NSButton>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Estado</p>
            <form action={toggleCategoryActiveAction.bind(null, tenantId, tenantSlug, category.id, !category.active)}>
              <button type="submit" className="text-xs font-semibold uppercase text-muted-foreground hover:text-accent-strong">
                {category.active ? "Desactivar" : "Activar"}
              </button>
            </form>
            <a
              href={`/${tenantSlug}/${category.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold uppercase text-accent-strong hover:underline"
            >
              Ver página
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function iconProps() {
  return { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
}
function ChevronUpIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M5 12.5 10 7.5l5 5" /></svg>;
}
function ChevronDownIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M5 7.5 10 12.5l5-5" /></svg>;
}
function EditIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M12.5 3.5 16 7l-8.5 8.5-4 1 1-4 8-8.5Z" /></svg>;
}
