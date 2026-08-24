import { listCategories, buildCategoryTree } from "@/lib/repositories/category-repository";
import { NSInput, NSLabel, NSSelect, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";
import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  toggleCategoryActiveAction,
  updateCategoryAction,
} from "@/app/admin/actions";
import type { Category } from "@/lib/types/catalog";

function CategoryRow({
  category,
  parents,
  isFirst,
  isLast,
}: {
  category: Category;
  parents: Category[];
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="rounded-card border border-border bg-surface-elevated p-5">
      <div className="mb-3 flex items-center gap-2">
        <form action={moveCategoryAction.bind(null, category.id, "up")}>
          <button
            type="submit"
            disabled={isFirst}
            aria-label="Mover arriba"
            className="flex h-7 w-7 items-center justify-center rounded-control border border-border-strong text-muted-foreground hover:border-accent-strong hover:text-accent-strong disabled:opacity-30"
          >
            ↑
          </button>
        </form>
        <form action={moveCategoryAction.bind(null, category.id, "down")}>
          <button
            type="submit"
            disabled={isLast}
            aria-label="Mover abajo"
            className="flex h-7 w-7 items-center justify-center rounded-control border border-border-strong text-muted-foreground hover:border-accent-strong hover:text-accent-strong disabled:opacity-30"
          >
            ↓
          </button>
        </form>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Orden de visualización
        </span>
      </div>
      <form action={updateCategoryAction.bind(null, category.id)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_2fr_auto]">
          <div>
            <NSLabel htmlFor={`name-${category.id}`}>Nombre</NSLabel>
            <NSInput id={`name-${category.id}`} name="name" defaultValue={category.name} required />
          </div>
          <div>
            <NSLabel htmlFor={`slug-${category.id}`}>Slug</NSLabel>
            <NSInput id={`slug-${category.id}`} name="slug" defaultValue={category.slug} required />
          </div>
          <div>
            <NSLabel htmlFor={`parent-${category.id}`}>Categoría padre</NSLabel>
            <NSSelect id={`parent-${category.id}`} name="parentId" defaultValue={category.parentId ?? ""}>
              <option value="">Ninguna (categoría principal)</option>
              {parents.filter((p) => p.id !== category.id).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </NSSelect>
          </div>
          <div>
            <NSLabel htmlFor={`desc-${category.id}`}>Descripción</NSLabel>
            <NSInput id={`desc-${category.id}`} name="description" defaultValue={category.description} />
          </div>
          <div className="flex items-end">
            <NSButton type="submit" variant="outline" size="sm">Guardar</NSButton>
          </div>
        </div>
        <div>
          <NSLabel>Foto de la categoría</NSLabel>
          <NSSingleImageUploader name="image" initialValue={category.image} label="Subir foto" />
        </div>
      </form>
      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
        <form action={toggleCategoryActiveAction.bind(null, category.id, !category.active)}>
          <button type="submit" className={"text-xs font-semibold uppercase " + (category.active ? "text-success" : "text-muted-foreground")}>
            {category.active ? "● Activa" : "○ Inactiva"} — cambiar
          </button>
        </form>
        <a href={`/${category.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold uppercase text-accent-strong hover:underline">
          Ver página
        </a>
        <NSAdminDeleteButton
          action={deleteCategoryAction.bind(null, category.id)}
          confirmMessage={`¿Eliminar la categoría "${category.name}"? Los productos existentes conservarán la categoría, pero la página /${category.slug} dejará de estar disponible.`}
        />
      </div>
    </div>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  const tree = buildCategoryTree(categories);
  const parents = categories.filter((c) => c.parentId === null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} categorías ({parents.length} principales). Se usan para las páginas /[categoría] y
          los filtros del catálogo. Una categoría principal (ej. Dama) agrupa las páginas de sus subcategorías
          (ej. Skinny, Cargo).
        </p>
      </div>

      <section className="max-w-xl rounded-card border border-border bg-surface-elevated p-6">
        <h2 className="font-display text-lg uppercase tracking-wide">Nueva categoría</h2>
        <form action={createCategoryAction} className="mt-4 flex flex-col gap-4">
          <div>
            <NSLabel htmlFor="new-name">Nombre</NSLabel>
            <NSInput id="new-name" name="name" required placeholder="Ej. Recto" />
          </div>
          <div>
            <NSLabel htmlFor="new-slug">Slug (opcional, se genera del nombre)</NSLabel>
            <NSInput id="new-slug" name="slug" placeholder="recto" />
            <p className="mt-1 text-xs text-muted-foreground">
              Si eliges una categoría padre abajo, se le antepone automáticamente (ej. &quot;dama-recto&quot;) para
              poder repetir el mismo nombre bajo distintas categorías principales.
            </p>
          </div>
          <div>
            <NSLabel htmlFor="new-parent">Categoría padre</NSLabel>
            <NSSelect id="new-parent" name="parentId" defaultValue="">
              <option value="">Ninguna (categoría principal, ej. Dama)</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </NSSelect>
          </div>
          <div>
            <NSLabel htmlFor="new-description">Descripción</NSLabel>
            <NSTextarea id="new-description" name="description" rows={2} />
          </div>
          <div>
            <NSLabel>Foto (opcional, se puede subir después)</NSLabel>
            <NSSingleImageUploader name="image" label="Subir foto" />
          </div>
          <NSButton type="submit" size="sm" className="self-start">Crear categoría</NSButton>
        </form>
      </section>

      <section className="flex flex-col gap-8">
        {tree.map((parent, parentIndex) => (
          <div key={parent.id} className="flex flex-col gap-4">
            <h2 className="font-display text-xl uppercase tracking-wide text-accent-strong">{parent.name}</h2>
            <CategoryRow
              category={parent}
              parents={parents}
              isFirst={parentIndex === 0}
              isLast={parentIndex === tree.length - 1}
            />
            {parent.children.length > 0 ? (
              <div className="ml-4 flex flex-col gap-4 border-l border-border pl-4 sm:ml-8 sm:pl-8">
                {parent.children.map((child, childIndex) => (
                  <CategoryRow
                    key={child.id}
                    category={child}
                    parents={parents}
                    isFirst={childIndex === 0}
                    isLast={childIndex === parent.children.length - 1}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
