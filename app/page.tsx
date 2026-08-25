import type { Metadata } from "next";
import Link from "next/link";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { NSButton } from "@/components/ui/NSButton";

export const metadata: Metadata = {
  title: "DS Catalog",
  description: "DS Catalog aloja catálogos y tiendas conversacionales independientes bajo un solo motor.",
};

const FEATURES = [
  {
    title: "Tu propio catálogo",
    description: "Cada negocio tiene su enlace, su panel y sus productos — separados del resto.",
  },
  {
    title: "Pedidos por WhatsApp",
    description: "El cliente arma su pedido y te llega directo a WhatsApp, listo para confirmar.",
  },
  {
    title: "Se adapta a tu negocio",
    description: "Moda, ferretería, restaurante, tecnología y más — el panel muestra solo lo que te sirve.",
  },
  {
    title: "Sin instalar nada",
    description: "Entra desde cualquier celular o computadora, tuyo o de tu cliente.",
  },
];

/**
 * Root landing — a marketing page for the platform, not a directory of
 * tenants. It used to list every active tenant as a public button (a
 * real privacy/professionalism issue for a multi-tenant SaaS), routing
 * visitors into a tenant's storefront from here. Now it only offers
 * "Crear mi catálogo" (self-registration) and "Acceder" (the centralized
 * /acceder login) — a tenant reaches their own storefront from inside
 * their admin panel instead ("← Ver sitio" in the admin sidebar).
 */
export default function RootLandingPage() {
  return (
    <div className="min-h-dvh bg-ink-950 text-ink-0">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <DSPlatformMark className="h-8 w-8" />
          <span className="font-display text-lg uppercase tracking-wide">DS Catalog</span>
        </div>
        <NSButton href="/acceder" variant="outline" size="sm">
          Acceder
        </NSButton>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
        <p className="rounded-pill border border-accent/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          Catálogos para negocios
        </p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
          Tu catálogo en línea, listo en minutos
        </h1>
        <p className="max-w-xl text-base text-ink-300 sm:text-lg">
          Crea tu catálogo, súbelo con tus propios productos y recibe pedidos directo por WhatsApp — sin
          complicaciones técnicas.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <NSButton href="/registro" size="lg">
            Crear mi catálogo
          </NSButton>
          <NSButton href="/acceder" variant="outline" size="lg">
            Ya tengo cuenta
          </NSButton>
        </div>
      </main>

      <section className="border-t border-ink-800 bg-ink-900/40 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2">
              <p className="font-display text-lg uppercase tracking-wide text-accent">{feature.title}</p>
              <p className="text-sm text-ink-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-center text-xs text-ink-500 sm:flex-row sm:justify-between sm:text-left">
        <p>DS Catalog — plataforma de catálogos multiempresa.</p>
        <Link href="/acceder" className="font-medium text-ink-400 hover:text-accent">
          Acceder a mi panel
        </Link>
      </footer>
    </div>
  );
}
