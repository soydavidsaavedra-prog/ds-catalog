import type { Testimonial } from "@/lib/types/catalog";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";

/**
 * Shared by both Themes (same reasoning as NSCartDrawer/NSToast): built
 * purely from semantic tokens, so it reskins correctly under whichever
 * `.theme-0X` scope wraps it, with no per-theme variant needed. Renders
 * nothing when a tenant has zero active testimonials — never fabricated,
 * always exactly what /admin/testimonios has curated.
 */
export function NSTestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <NSSectionHeading eyebrow="Prueba social" title="Lo que dicen nuestros clientes" align="center" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="flex flex-col gap-4 rounded-card border border-border bg-surface-elevated p-6"
          >
            <div className="flex gap-0.5 text-accent-strong" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < testimonial.rating} />
              ))}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-foreground">“{testimonial.quote}”</blockquote>
            <figcaption className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent-strong">
                {initials(testimonial.authorName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{testimonial.authorName}</p>
                {testimonial.authorRole ? (
                  <p className="truncate text-xs text-muted-foreground">{testimonial.authorRole}</p>
                ) : null}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4">
      <path strokeLinejoin="round" d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.5l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L10 2.5Z" />
    </svg>
  );
}
