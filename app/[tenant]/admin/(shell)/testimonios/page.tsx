import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listTestimonials } from "@/lib/repositories/testimonials-repository";
import { NSTestimonialForm } from "@/components/admin/NSTestimonialForm";
import { NSTestimonialList } from "@/components/admin/NSTestimonialList";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";

export default async function AdminTestimonialsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const testimonials = await listTestimonials(tenant.id);

  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <DSPageHeader
        title="Testimonios"
        description="Testimonios reales de tus clientes, mostrados en tu página de inicio. Escríbelos a partir de lo que te dicen — nunca se inventan aquí."
      />

      <DSCard title="Nuevo testimonio">
        <NSTestimonialForm tenantId={tenant.id} tenantSlug={tenantSlug} />
      </DSCard>

      <DSCard title="Tus testimonios">
        <NSTestimonialList tenantId={tenant.id} tenantSlug={tenantSlug} testimonials={testimonials} />
      </DSCard>
    </div>
  );
}
