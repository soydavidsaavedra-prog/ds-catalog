import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSReveal } from "@/components/ui/NSReveal";

const STEP_LABELS = ["Tela", "Corte", "Confección", "Detalle", "Producto"];

export interface NSFactoryStoryProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  stepImages?: [string, string, string, string, string];
  brandName?: string;
}

const DEFAULTS: Required<Pick<NSFactoryStoryProps, "eyebrow" | "title" | "description">> = {
  eyebrow: "Nuestro proceso",
  title: "De la fábrica a tus manos",
  description:
    "Cada jean nace en nuestra fábrica: tela seleccionada, corte preciso, confección artesanal y un control de detalle que no se negocia.",
};

const DEFAULT_STEP_IMAGES: [string, string, string, string, string] = [
  "placeholder:fábrica:story-tela",
  "placeholder:fábrica:story-corte",
  "placeholder:fábrica:story-confeccion",
  "placeholder:fábrica:story-detalle",
  "placeholder:fábrica:story-producto",
];

/**
 * "De la fábrica a tus manos" section — content is admin-editable (see
 * /admin/inicio, backed by SiteSettings.story*), all props default to the
 * original launch copy/art so the section renders identically until an
 * admin customizes it. Step labels (Tela/Corte/...) stay fixed; only the
 * heading copy and the 5 step photos are editable.
 */
export function NSFactoryStory({
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  description = DEFAULTS.description,
  stepImages = DEFAULT_STEP_IMAGES,
  brandName,
}: NSFactoryStoryProps) {
  return (
    <section className="bg-ink-950 py-20 text-ink-0 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NSSectionHeading
          align="center"
          tone="inverted"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mx-auto"
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-3">
          {STEP_LABELS.map((label, index) => (
            <NSReveal key={label} delay={index * 0.08} className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-card">
                <NSMedia src={stepImages[index]} alt={label} className="h-full w-full" brandName={brandName} />
                <span className="absolute left-2.5 top-2.5 font-display text-3xl text-accent opacity-90">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-200">
                {label}
              </p>
            </NSReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
