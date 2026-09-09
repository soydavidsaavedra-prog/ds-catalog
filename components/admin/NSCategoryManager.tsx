"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/types/catalog";
import type { CategoryNode } from "@/lib/repositories/category-repository";
import { NSInput, NSLabel, NSSelect, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { NSCategoryRow } from "@/components/admin/NSCategoryRow";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";

type StatusFilter = "all" | "active" | "inactive";

function matchesQuery(category: Category, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q);
}

function matchesStatus(category: Category, status: StatusFilter): boolean {
  if (status === "all") return true;
  return status === "active" ? category.active : !category.active;
}

export function NSCategoryManager({
  tenantId,
  tenantSlug,
  tree,
  parents,
  productCountBySlug,
  createAction,
  exampleParentCategory,
  exampleChildCategory,
}: {
  tenantId: string;
  tenantSlug: string;
  tree: CategoryNode[];
  parents: Category[];
  productCountBySlug: Record<string, number>;
  createAction: (formData: FormData) => Promise<void>;
  exampleParentCategory: { name: string; slug: string };
  exampleChildCategory: { name: string; slug: string };
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showCreate, setShowCreate] = useState(false);

  const totalCount = tree.reduce((sum, p) => sum + 1 + p.children.length, 0);

  const visibleGroups = useMemo(() => {
    const filtering = query.trim() !== "" || statusFilter !== "all";
    if (!filtering) return tree.map((parent) => ({ parent, children: parent.children, parentMatches: true }));

    return tree
      .map((parent) => {
        const parentMatches = matchesQuery(parent, query) && matchesStatus(parent, statusFilter);
        const matchingChildren = parent.children.filter((c) => matchesQuery(c, query) && matchesStatus(c, statusFilter));
        return { parent, children: parentMatches ? parent.children : matchingChildren, parentMatches };
      })
      .filter((group) => group.parentMatches || group.children.length > 0);
  }, [tree, query, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <DSPageHeader
        title="Categorías"
        description="Organiza la estructura de productos de tu catálogo."
        actions={
          <NSButton size="sm" onClick={() => setShowCreate((v) => !v)} icon={<PlusIcon className="h-4 w-4" />}>
            {showCreate ? "Cerrar" : "Nueva categoría"}
          </NSButton>
        }
      />

      {totalCount > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <NSInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o slug…"
            className="sm:max-w-xs"
          />
          <NSSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="sm:max-w-xs">
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </NSSelect>
          <p className="text-xs text-muted-foreground sm:ml-auto">{totalCount} categorías</p>
        </div>
      ) : null}

      {showCreate ? (
        <DSCard title="Nueva categoría" className="max-w-xl">
          <form action={createAction} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <NSLabel htmlFor="new-name">Nombre</NSLabel>
                <NSInput id="new-name" name="name" required placeholder={`Ej. ${exampleChildCategory.name}`} />
              </div>
              <div>
                <NSLabel htmlFor="new-slug">Slug (opcional, se genera del nombre)</NSLabel>
                <NSInput id="new-slug" name="slug" placeholder="recto" />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Si eliges una categoría padre abajo, se le antepone automáticamente (ej. &quot;{exampleParentCategory.slug}-{exampleChildCategory.slug}&quot;)
              para poder repetir el mismo nombre bajo distintas categorías principales.
            </p>
            <div>
              <NSLabel htmlFor="new-parent">Categoría padre</NSLabel>
              <NSSelect id="new-parent" name="parentId" defaultValue="">
                <option value="">Ninguna (categoría principal, ej. {exampleParentCategory.name})</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </NSSelect>
            </div>
            <div>
              <NSLabel htmlFor="new-description">Descripción</NSLabel>
              <NSTextarea id="new-description" name="description" rows={2} />
            </div>
            <div>
              <NSLabel>Foto (opcional, se puede subir después)</NSLabel>
              <NSSingleImageUploader tenantSlug={tenantSlug} name="image" label="Subir foto" />
            </div>
            <NSButton type="submit" size="sm" className="self-start">
              Crear categoría
            </NSButton>
          </form>
        </DSCard>
      ) : null}

      {totalCount === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-16 text-center">
          <FolderIcon className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">No tienes categorías todavía</p>
          <p className="max-w-sm text-sm text-muted-foreground">Crea tu primera categoría para organizar tu catálogo.</p>
          {!showCreate ? (
            <NSButton size="sm" className="mt-2" onClick={() => setShowCreate(true)}>
              + Crear categoría
            </NSButton>
          ) : null}
        </div>
      ) : visibleGroups.length === 0 ? (
        <p className="rounded-card border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Ninguna categoría coincide con la búsqueda.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {visibleGroups.map(({ parent, children }, parentIndex) => (
            <div key={parent.id} className="flex flex-col gap-3">
              <NSCategoryRow
                tenantId={tenantId}
                tenantSlug={tenantSlug}
                category={parent}
                parents={parents}
                productCount={productCountBySlug[parent.slug] ?? 0}
                isFirst={parentIndex === 0}
                isLast={parentIndex === tree.length - 1}
              />
              {children.length > 0 ? (
                <div className="ml-6 flex flex-col gap-3 border-l border-border pl-4 sm:ml-10 sm:pl-6">
                  {children.map((child, childIndex) => (
                    <NSCategoryRow
                      key={child.id}
                      tenantId={tenantId}
                      tenantSlug={tenantSlug}
                      category={child}
                      parents={parents}
                      parentName={parent.name}
                      productCount={productCountBySlug[child.slug] ?? 0}
                      isFirst={childIndex === 0}
                      isLast={childIndex === parent.children.length - 1}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function iconProps() {
  return { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
}
function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M10 4v12M4 10h12" /></svg>;
}
function FolderIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M2.5 6a1 1 0 0 1 1-1h4l1.5 2h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-12.5a1 1 0 0 1-1-1V6Z" /></svg>;
}
