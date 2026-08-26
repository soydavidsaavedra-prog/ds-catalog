import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listHeroSlides } from "@/lib/repositories/hero-slide-repository";
import { NSHeroSlideUploadForm } from "@/components/admin/NSHeroSlideUploadForm";
import { NSHeroSlideList } from "@/components/admin/NSHeroSlideList";

export default async function AdminHeroPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const slides = await listHeroSlides(tenant.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Hero</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fotos y videos que rotan automáticamente en la portada de tu catálogo. El título, subtítulo y botón siguen
          viniendo de{" "}
          <a href={`/${tenantSlug}/admin/inicio`} className="underline hover:text-accent-strong">
            Inicio
          </a>{" "}
          — aquí solo agregas lo que se ve detrás. Sin ninguna foto/video aquí, se muestra la imagen de portada de
          Inicio como siempre.
        </p>
      </div>

      <NSHeroSlideUploadForm tenantId={tenant.id} tenantSlug={tenantSlug} nextOrder={slides.length + 1} />
      <NSHeroSlideList tenantId={tenant.id} tenantSlug={tenantSlug} slides={slides} />
    </div>
  );
}
