import { listBanners } from "@/lib/repositories/banner-repository";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { createBannerAction, deleteBannerAction, updateBannerAction } from "@/app/admin/actions";

export default async function AdminBannersPage() {
  const banners = await listBanners();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Banners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Controla los banners promocionales de la tienda sin tocar código.
        </p>
      </div>

      <section className="max-w-2xl rounded-card border border-border bg-surface-elevated p-6">
        <h2 className="font-display text-lg uppercase tracking-wide">Nuevo banner</h2>
        <form action={createBannerAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <NSLabel htmlFor="new-title">Título</NSLabel>
            <NSInput id="new-title" name="title" required />
          </div>
          <div>
            <NSLabel htmlFor="new-subtitle">Subtítulo</NSLabel>
            <NSInput id="new-subtitle" name="subtitle" />
          </div>
          <div>
            <NSLabel htmlFor="new-image">Imagen (URL)</NSLabel>
            <NSInput id="new-image" name="image" placeholder="https://... o placeholder:banner:1" />
          </div>
          <div>
            <NSLabel htmlFor="new-cta">Texto del botón</NSLabel>
            <NSInput id="new-cta" name="ctaLabel" placeholder="Ver colección" />
          </div>
          <div>
            <NSLabel htmlFor="new-href">Enlace del botón</NSLabel>
            <NSInput id="new-href" name="ctaHref" placeholder="/catalogo" />
          </div>
          <div>
            <NSLabel htmlFor="new-order">Orden</NSLabel>
            <NSInput id="new-order" name="order" type="number" defaultValue={banners.length + 1} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4 rounded border-border-strong accent-[var(--color-gold-400)]" />
            Activo
          </label>
          <NSButton type="submit" size="sm" className="self-start sm:col-span-2">Crear banner</NSButton>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="rounded-card border border-border bg-surface-elevated p-5">
            <form action={updateBannerAction.bind(null, banner.id)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <NSLabel htmlFor={`title-${banner.id}`}>Título</NSLabel>
                <NSInput id={`title-${banner.id}`} name="title" defaultValue={banner.title} required />
              </div>
              <div>
                <NSLabel htmlFor={`subtitle-${banner.id}`}>Subtítulo</NSLabel>
                <NSInput id={`subtitle-${banner.id}`} name="subtitle" defaultValue={banner.subtitle} />
              </div>
              <div>
                <NSLabel htmlFor={`image-${banner.id}`}>Imagen (URL)</NSLabel>
                <NSInput id={`image-${banner.id}`} name="image" defaultValue={banner.image} />
              </div>
              <div>
                <NSLabel htmlFor={`cta-${banner.id}`}>Texto del botón</NSLabel>
                <NSInput id={`cta-${banner.id}`} name="ctaLabel" defaultValue={banner.ctaLabel} />
              </div>
              <div>
                <NSLabel htmlFor={`href-${banner.id}`}>Enlace del botón</NSLabel>
                <NSInput id={`href-${banner.id}`} name="ctaHref" defaultValue={banner.ctaHref} />
              </div>
              <div>
                <NSLabel htmlFor={`order-${banner.id}`}>Orden</NSLabel>
                <NSInput id={`order-${banner.id}`} name="order" type="number" defaultValue={banner.order} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="active" defaultChecked={banner.active} className="h-4 w-4 rounded border-border-strong accent-[var(--color-gold-400)]" />
                Activo
              </label>
              <div className="flex items-center gap-4 sm:col-span-2">
                <NSButton type="submit" variant="outline" size="sm">Guardar</NSButton>
                <NSAdminDeleteButton
                  action={deleteBannerAction.bind(null, banner.id)}
                  confirmMessage={`¿Eliminar el banner "${banner.title}"?`}
                />
              </div>
            </form>
          </div>
        ))}
        {banners.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay banners creados.</p>
        ) : null}
      </section>
    </div>
  );
}
