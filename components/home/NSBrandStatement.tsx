import { NSPlaceholderArt } from "@/components/ui/NSPlaceholderArt";
import { NSReveal } from "@/components/ui/NSReveal";

const TRUST_ITEMS = [
  { title: "Calidad premium", description: "Materiales seleccionados" },
  { title: "Diseño exclusivo", description: "Tendencias y estilo" },
  { title: "Fabricación propia", description: "Control total de calidad" },
  { title: "Envíos a todo el país", description: "Rápido y seguro" },
  { title: "Atención personalizada", description: "Estamos para ayudarte" },
];

export function NSBrandStatement() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-ink-0">
        <div className="grid sm:grid-cols-2">
          <NSReveal className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-20">
            <p className="font-display text-4xl uppercase leading-[0.9] tracking-wide sm:text-6xl">
              Denim is
              <br />
              <span className="text-accent">our language</span>
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-300">
              Calidad que se siente, estilo que te define. Cada pieza sale de nuestra fábrica con
              un mismo propósito: vestir bien, sin intermediarios.
            </p>
          </NSReveal>
          <div className="relative aspect-square sm:aspect-auto">
            <NSPlaceholderArt category="denim" seed="brand-statement" label="Denim is our language" className="h-full w-full" />
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
