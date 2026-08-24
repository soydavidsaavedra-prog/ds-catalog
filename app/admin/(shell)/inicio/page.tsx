import { getSettings } from "@/lib/repositories/settings-repository";
import { NSHeroEditorForm } from "@/components/admin/NSHeroEditorForm";
import { NSStoryEditorForm } from "@/components/admin/NSStoryEditorForm";
import { NSStatementEditorForm } from "@/components/admin/NSStatementEditorForm";

export default async function AdminHomePage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Inicio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personaliza las secciones de la portada de la tienda. Los cambios se ven en la vista previa
          antes de guardar.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-accent-strong">Portada (Hero)</h2>
        <div className="rounded-card border border-border bg-surface-elevated p-6">
          <NSHeroEditorForm settings={settings} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-accent-strong">
          Nuestra fábrica (&quot;De la fábrica a tus manos&quot;)
        </h2>
        <div className="rounded-card border border-border bg-surface-elevated p-6">
          <NSStoryEditorForm settings={settings} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-accent-strong">
          &quot;Denim is our language&quot;
        </h2>
        <div className="rounded-card border border-border bg-surface-elevated p-6">
          <NSStatementEditorForm settings={settings} />
        </div>
      </section>
    </div>
  );
}
