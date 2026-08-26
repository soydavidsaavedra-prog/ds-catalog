import type { Metadata } from "next";
import Link from "next/link";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { NSButton } from "@/components/ui/NSButton";
import { NSPrice } from "@/components/ui/NSPrice";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";
import { listPlans } from "@/lib/repositories/plans-repository";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";

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
 *
 * The plans + WhatsApp CTA below intentionally don't let a visitor buy
 * anything on their own — there's no self-serve checkout yet (see
 * ANALISIS_HORIZON_REFERENCIA_SAAS.md sección 6). The point is
 * advertising, so an interested visitor messages the platform's own
 * support WhatsApp (lib/repositories/platform-settings-repository.ts,
 * editable from /superadmin/configuracion) and gets advised there.
 */
export default async function RootLandingPage() {
  const [plans, platformSettings] = await Promise.all([listPlans(), getPlatformSettings()]);
  const activePlans = plans.filter((p) => p.active);
  const supportNumber = platformSettings.supportWhatsappNumber;

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

      {activePlans.length > 0 ? (
        <section className="border-t border-ink-800 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mx-auto max-w-xl text-center">
              <p className="font-display text-2xl uppercase tracking-wide sm:text-3xl">Planes</p>
              <p className="mt-2 text-sm text-ink-400">
                Escríbenos y te asesoramos para elegir el plan que mejor le queda a tu negocio.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activePlans.map((plan) => (
                <div key={plan.id} className="flex flex-col gap-4 rounded-card border border-ink-800 bg-ink-900 p-6">
                  <div>
                    <p className="font-display text-xl uppercase tracking-wide">{plan.name}</p>
                    <NSPrice amount={plan.priceCents / 100} size="lg" className="mt-1" />
                    <p className="mt-2 text-sm text-ink-400">{plan.description}</p>
                  </div>
                  {plan.features.length > 0 ? (
                    <ul className="flex flex-1 flex-col gap-1.5 text-sm text-ink-300">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-0.5 text-accent">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {supportNumber ? (
                    <NSWhatsAppButton
                      whatsappNumber={supportNumber}
                      message={`Hola, me interesa el plan ${plan.name} de DS Catalog.`}
                    >
                      Quiero este plan
                    </NSWhatsAppButton>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {supportNumber ? (
        <section className="border-t border-ink-800 bg-ink-900/40 py-16 text-center">
          <div className="mx-auto max-w-xl px-6">
            <p className="font-display text-xl uppercase tracking-wide sm:text-2xl">¿Tienes dudas?</p>
            <p className="mt-2 text-sm text-ink-400">
              Escríbenos directo por WhatsApp y te ayudamos a elegir la mejor opción para tu negocio.
            </p>
            <NSWhatsAppButton
              whatsappNumber={supportNumber}
              message="Hola, tengo dudas sobre DS Catalog y sus planes."
              className="mx-auto mt-6 max-w-xs"
            >
              Hablar por WhatsApp
            </NSWhatsAppButton>
          </div>
        </section>
      ) : null}

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-center text-xs text-ink-500 sm:flex-row sm:justify-between sm:text-left">
        <p>DS Catalog — plataforma de catálogos multiempresa.</p>
        <Link href="/acceder" className="font-medium text-ink-400 hover:text-accent">
          Acceder a mi panel
        </Link>
      </footer>
    </div>
  );
}
