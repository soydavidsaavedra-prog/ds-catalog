"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/catalog";
import { NSInput, NSLabel, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

/**
 * "Crear una categoría nueva sin salir del formulario de producto" —
 * intentionally minimal (name + optional parent only, no image/description):
 * the full editor for those stays at /admin/categorias, linked from
 * Personalización. This just unblocks the common case, then hands the
 * new Category back to NSProductForm to add to its select and pick.
 */
export function NSInlineCategoryCreator({
  parents,
  existingNames,
  quickCreateAction,
  onCreated,
}: {
  parents: Category[];
  existingNames: string[];
  quickCreateAction: (formData: FormData) => Promise<Category | { error: string }>;
  onCreated: (category: Category) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const possibleDuplicate =
    trimmedName.length > 1 && existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase());

  async function handleCreate() {
    if (!trimmedName) return;
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("name", trimmedName);
    if (parentId) formData.set("parentId", parentId);
    const result = await quickCreateAction(formData);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onCreated(result);
    setName("");
    setParentId("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 text-xs font-semibold text-accent-strong hover:underline"
      >
        + Nueva categoría
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-control border border-dashed border-border-strong bg-surface p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <NSLabel htmlFor="quick-category-name">Nombre de la nueva categoría</NSLabel>
          <NSInput
            id="quick-category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Herramientas eléctricas"
            list="existing-category-names"
            autoFocus
          />
          <datalist id="existing-category-names">
            {existingNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <div>
          <NSLabel htmlFor="quick-category-parent">Categoría padre (opcional)</NSLabel>
          <NSSelect id="quick-category-parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">Ninguna (categoría principal)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </NSSelect>
        </div>
      </div>
      {possibleDuplicate ? (
        <p className="text-xs text-warning">Ya existe una categoría con ese nombre — revisa si no es la misma antes de crear otra.</p>
      ) : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <div className="flex items-center gap-3">
        <NSButton type="button" size="sm" onClick={handleCreate} loading={pending} disabled={!trimmedName}>
          Crear y usar
        </NSButton>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
            setName("");
            setParentId("");
          }}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
