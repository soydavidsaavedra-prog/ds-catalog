import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { listHeroSlides } from "@/lib/repositories/hero-slide-repository";
import { NSHeroEditorForm } from "@/components/admin/NSHeroEditorForm";
import { NSStoryEditorForm } from "@/components/admin/NSStoryEditorForm";
import { NSStatementEditorForm } from "@/components/admin/NSStatementEditorForm";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [settings, heroSlides] = await Promise.all([getSettings(tenant.id), listHeroSlides(tenant.id)]);

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
          <NSHeroEditorForm tenantId={tenant.id} tenantSlug={tenantSlug} settings={settings} slides={heroSlides} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-accent-strong">Historia de marca</h2>
        <div className="rounded-card border border-border bg-surface-elevated p-6">
          <NSStoryEditorForm tenantId={tenant.id} tenantSlug={tenantSlug} settings={settings} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-accent-strong">Frase destacada</h2>
        <div className="rounded-card border border-border bg-surface-elevated p-6">
          <NSStatementEditorForm tenantId={tenant.id} tenantSlug={tenantSlug} settings={settings} />
        </div>
      </section>
    </div>
  );
}
