import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSPlaceholderArt } from "@/components/ui/NSPlaceholderArt";
import { NSReveal } from "@/components/ui/NSReveal";

const STEPS = [
  { n: "01", label: "Tela", seed: "story-tela" },
  { n: "02", label: "Corte", seed: "story-corte" },
  { n: "03", label: "Confección", seed: "story-confeccion" },
  { n: "04", label: "Detalle", seed: "story-detalle" },
  { n: "05", label: "Producto", seed: "story-producto" },
];

export function NSFactoryStory() {
  return (
    <section className="bg-ink-950 py-20 text-ink-0 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NSSectionHeading
          align="center"
          tone="inverted"
          eyebrow="Nuestro proceso"
          title="De la fábrica a tus manos"
          description="Cada jean nace en nuestra fábrica: tela seleccionada, corte preciso, confección artesanal y un control de detalle que no se negocia."
          className="mx-auto"
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-3">
          {STEPS.map((step, index) => (
            <NSReveal key={step.n} delay={index * 0.08} className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-card">
                <NSPlaceholderArt category="fábrica" seed={step.seed} label={step.label} className="h-full w-full" />
                <span className="absolute left-2.5 top-2.5 font-display text-3xl text-accent opacity-90">
                  {step.n}
                </span>
              </div>
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-200">
                {step.label}
              </p>
            </NSReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
