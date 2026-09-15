"use client";

import { updateTestimonialAction, deleteTestimonialAction } from "@/app/[tenant]/admin/actions";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { NSLabel, NSInput, NSTextarea, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import type { Testimonial } from "@/lib/types/catalog";

export function NSTestimonialList({
  tenantId,
  tenantSlug,
  testimonials,
}: {
  tenantId: string;
  tenantSlug: string;
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no agregaste ningún testimonio.</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      {testimonials.map((testimonial) => (
        <NSTestimonialRow key={testimonial.id} tenantId={tenantId} tenantSlug={tenantSlug} testimonial={testimonial} />
      ))}
    </section>
  );
}

function NSTestimonialRow({
  tenantId,
  tenantSlug,
  testimonial,
}: {
  tenantId: string;
  tenantSlug: string;
  testimonial: Testimonial;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-elevated p-5">
      <form
        action={updateTestimonialAction.bind(null, tenantId, tenantSlug, testimonial.id)}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div>
          <NSLabel htmlFor={`author-${testimonial.id}`}>Nombre del cliente</NSLabel>
          <NSInput id={`author-${testimonial.id}`} name="authorName" defaultValue={testimonial.authorName} required />
        </div>
        <div>
          <NSLabel htmlFor={`role-${testimonial.id}`}>Contexto (opcional)</NSLabel>
          <NSInput id={`role-${testimonial.id}`} name="authorRole" defaultValue={testimonial.authorRole} />
        </div>
        <div className="sm:col-span-2">
          <NSLabel htmlFor={`quote-${testimonial.id}`}>Testimonio</NSLabel>
          <NSTextarea id={`quote-${testimonial.id}`} name="quote" defaultValue={testimonial.quote} required />
        </div>
        <div>
          <NSLabel htmlFor={`rating-${testimonial.id}`}>Calificación</NSLabel>
          <NSSelect id={`rating-${testimonial.id}`} name="rating" defaultValue={String(testimonial.rating)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "estrella" : "estrellas"}
              </option>
            ))}
          </NSSelect>
        </div>
        <label className="flex items-center gap-2 self-end text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            defaultChecked={testimonial.active}
            className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
          />
          Activo
        </label>
        <div className="sm:col-span-2">
          <NSButton type="submit" variant="outline" size="sm">
            Guardar
          </NSButton>
        </div>
      </form>
      <NSAdminDeleteButton
        action={deleteTestimonialAction.bind(null, tenantId, tenantSlug, testimonial.id)}
        confirmMessage="¿Eliminar este testimonio?"
      />
    </div>
  );
}
