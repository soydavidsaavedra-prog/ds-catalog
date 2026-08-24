import { getSettings } from "@/lib/repositories/settings-repository";
import { NSHeroEditorForm } from "@/components/admin/NSHeroEditorForm";

export default async function AdminHomePage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Inicio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personaliza la portada de la tienda: imagen, textos y botón. Los cambios se ven en la vista
          previa antes de guardar.
        </p>
      </div>
      <div className="rounded-card border border-border bg-surface-elevated p-6">
        <NSHeroEditorForm settings={settings} />
      </div>
    </div>
  );
}
