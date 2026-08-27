import { NSMedia } from "@/components/ui/NSMedia";
import { NSReveal } from "@/components/ui/NSReveal";

const TRUST_ITEMS = [
  { title: "Calidad premium", description: "Materiales seleccionados" },
  { title: "Diseño exclusivo", description: "Tendencias y estilo" },
  { title: "Fabricación propia", description: "Control total de calidad" },
  { title: "Envíos a todo el país", description: "Rápido y seguro" },
  { title: "Atención personalizada", description: "Estamos para ayudarte" },
];

export interface NSBrandStatementProps {
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  image?: string;
  brandName?: string;
}

const DEFAULTS: Required<Omit<NSBrandStatementProps, "brandName">> = {
  titleLine1: "Denim is",
  titleLine2: "our language",
  description:
    "Calidad que se siente, estilo que te define. Cada pieza sale de nuestra fábrica con un mismo propósito: vestir bien, sin intermediarios.",
  image: "placeholder:denim:brand-statement",
};

/**
 * "Denim is our language" section — content is admin-editable (see
 * /admin/inicio, backed by SiteSettings.statement*), props default to the
 * original launch copy/art so the section renders identically until an
 * admin customizes it. The 5 trust items below stay fixed by design.
 */
export function NSBrandStatement({
  titleLine1 = DEFAULTS.titleLine1,
  titleLine2 = DEFAULTS.titleLine2,
  description = DEFAULTS.description,
  image = DEFAULTS.image,
  brandName,
}: NSBrandStatementProps) {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-ink-0">
        <div className="grid sm:grid-cols-2">
          <NSReveal className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-20">
            <p className="font-display text-4xl uppercase leading-[0.9] tracking-wide sm:text-6xl">
              {titleLine1}
              <br />
              <span className="text-accent">{titleLine2}</span>
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-300">{description}</p>
          </NSReveal>
          <div className="relative aspect-square sm:aspect-auto">
            <NSMedia src={image} alt={`${titleLine1} ${titleLine2}`} className="h-full w-full" brandName={brandName} />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
