import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getSettings } from "@/lib/repositories/settings-repository";
import { listHeroSlides } from "@/lib/repositories/hero-slide-repository";
import { NSHeroEditorForm } from "@/components/admin/NSHeroEditorForm";
import { NSStoryEditorForm } from "@/components/admin/NSStoryEditorForm";
import { NSStatementEditorForm } from "@/components/admin/NSStatementEditorForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [settings, heroSlides] = await Promise.all([getSettings(tenant.id), listHeroSlides(tenant.id)]);

  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <DSPageHeader
        title="Inicio"
        description="Personaliza las secciones de la portada de la tienda. Los cambios se ven en la vista previa antes de guardar."
      />

      <DSCard title="Portada (Hero)">
        <NSHeroEditorForm tenantId={tenant.id} tenantSlug={tenantSlug} theme={tenant.theme} settings={settings} slides={heroSlides} />
      </DSCard>

      <DSCard title="Historia de marca">
        <NSStoryEditorForm tenantId={tenant.id} tenantSlug={tenantSlug} theme={tenant.theme} settings={settings} />
      </DSCard>

      <DSCard title="Frase destacada">
        <NSStatementEditorForm tenantId={tenant.id} tenantSlug={tenantSlug} theme={tenant.theme} settings={settings} />
      </DSCard>
    </div>
  );
}
