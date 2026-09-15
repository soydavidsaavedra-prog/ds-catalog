import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { listProducts } from "@/lib/repositories/product-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { listHeroSlides } from "@/lib/repositories/hero-slide-repository";
import { listTestimonials } from "@/lib/repositories/testimonials-repository";
import { getEffectivePlanForTenant } from "@/lib/tenant/plan-limits";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { NSDesignStudio } from "@/components/admin/design-studio/NSDesignStudio";

export const metadata: Metadata = {
  title: "Estudio de diseño",
};

export default async function AdminDesignStudioPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);

  // Same data + same activeOnly scoping the real storefront Home uses
  // (app/[tenant]/(storefront)/page.tsx) — the canvas must show exactly
  // what a visitor would see, not a superset with inactive items.
  const [categories, products, settings, heroSlides, testimonials, plan] = await Promise.all([
    listCategories(tenant.id, { activeOnly: true }),
    listProducts(tenant.id, { activeOnly: true }),
    getSettings(tenant.id),
    listHeroSlides(tenant.id, { activeOnly: true }),
    listTestimonials(tenant.id, { activeOnly: true }),
    getEffectivePlanForTenant(tenant.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <DSPageHeader
        title="Estudio de diseño"
        description="Haz click en cualquier sección de la vista previa para editarla, o cambia de dispositivo para ver cómo se ve en cada tamaño de pantalla."
      />
      <NSDesignStudio
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        settings={settings}
        categories={categories}
        products={products}
        heroSlides={heroSlides}
        testimonials={testimonials}
        savedTheme={tenant.theme}
        allowedThemes={plan?.allowedThemes ?? null}
      />
    </div>
  );
}
