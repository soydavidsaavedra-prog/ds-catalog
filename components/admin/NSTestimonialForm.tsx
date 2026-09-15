"use client";

import { useRef } from "react";
import { createTestimonialAction } from "@/app/[tenant]/admin/actions";
import { NSLabel, NSInput, NSTextarea, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";

export function NSTestimonialForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTestimonialAction(tenantId, tenantSlug, formData);
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <NSLabel htmlFor="testimonial-author">Nombre del cliente</NSLabel>
        <NSInput id="testimonial-author" name="authorName" required placeholder="María Pérez" />
      </div>
      <div>
        <NSLabel htmlFor="testimonial-role">Contexto (opcional)</NSLabel>
        <NSInput id="testimonial-role" name="authorRole" placeholder="Cliente frecuente" />
      </div>
      <div className="sm:col-span-2">
        <NSLabel htmlFor="testimonial-quote">Testimonio</NSLabel>
        <NSTextarea id="testimonial-quote" name="quote" required placeholder="Lo que dijo tu cliente sobre tu producto o servicio..." />
      </div>
      <div>
        <NSLabel htmlFor="testimonial-rating">Calificación</NSLabel>
        <NSSelect id="testimonial-rating" name="rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "estrella" : "estrellas"}
            </option>
          ))}
        </NSSelect>
      </div>
      <div className="flex items-end sm:col-span-2">
        <NSButton type="submit" size="sm">
          Agregar testimonio
        </NSButton>
      </div>
    </form>
  );
}
