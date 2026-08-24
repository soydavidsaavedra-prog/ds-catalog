import { listCategories } from "@/lib/repositories/category-repository";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
  updateCategoryAction,
} from "@/app/admin/actions";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} categorías. Se usan para las páginas /[categoría] y los filtros del catálogo.
        </p>
      </div>

      <section className="max-w-xl rounded-card border border-border bg-surface-elevated p-6">
        <h2 className="font-display text-lg uppercase tracking-wide">Nueva categoría</h2>
        <form action={createCategoryAction} className="mt-4 flex flex-col gap-4">
          <div>
            <NSLabel htmlFor="new-name">Nombre</NSLabel>
            <NSInput id="new-name" name="name" required placeholder="Ej. Overoles" />
          </div>
          <div>
            <NSLabel htmlFor="new-slug">Slug (opcional, se genera del nombre)</NSLabel>
            <NSInput id="new-slug" name="slug" placeholder="overoles" />
          </div>
          <div>
            <NSLabel htmlFor="new-description">Descripción</NSLabel>
            <NSTextarea id="new-description" name="description" rows={2} />
          </div>
          <NSButton type="submit" size="sm" className="self-start">Crear categoría</NSButton>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-card border border-border bg-surface-elevated p-5">
            <form action={updateCategoryAction.bind(null, category.id)} className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr_auto]">
              <div>
                <NSLabel htmlFor={`name-${category.id}`}>Nombre</NSLabel>
                <NSInput id={`name-${category.id}`} name="name" defaultValue={category.name} required />
              </div>
              <div>
                <NSLabel htmlFor={`slug-${category.id}`}>Slug</NSLabel>
                <NSInput id={`slug-${category.id}`} name="slug" defaultValue={category.slug} required />
              </div>
              <div>
                <NSLabel htmlFor={`desc-${category.id}`}>Descripción</NSLabel>
                <NSInput id={`desc-${category.id}`} name="description" defaultValue={category.description} />
              </div>
              <div className="flex items-end">
                <NSButton type="submit" variant="outline" size="sm">Guardar</NSButton>
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
        ))}
      </section>
    </div>
  );
}
