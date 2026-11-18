import type { Metadata } from "next";
import { NSButton } from "@/components/ui/NSButton";
import { NSReveal } from "@/components/ui/NSReveal";
import { NSSpotlightCard } from "@/components/ui/NSSpotlightCard";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";

export const metadata: Metadata = {
  title: "Sistema de gestión de estacionamientos | DS Studio",
  description:
    "App móvil y panel web para administrar un estacionamiento en tiempo real — el mismo sistema en funcionamiento en PARKEALO. Descarga la demo.",
};

const CHALLENGES = [
  { title: "Registros manuales", description: "Cuadernos y planillas difíciles de consultar y respaldar." },
  { title: "Cobros calculados a mano", description: "Tiempo y tarifa expuestos a errores y discusiones." },
  { title: "Cuadratura de caja", description: "Diferencias difíciles de explicar al cerrar un turno." },
  { title: "Poca visibilidad", description: "El dueño se entera de lo ocurrido cuando ya pasó." },
  { title: "Sin trazabilidad", description: "Anulaciones y cambios que no dejan registro." },
  { title: "Sin historial", description: "No se sabe si un vehículo ya visitó el recinto." },
];

const PILLARS = [
  { title: "Aplicación móvil", description: "Los operadores registran entradas, salidas y pagos." },
  { title: "Base de datos propia", description: "La información queda centralizada en un solo lugar." },
  { title: "Panel web", description: "Dueño y supervisores controlan en tiempo real." },
];

const APP_STEPS = [
  { title: "Entrada", description: "Lectura y confirmación de matrícula, con hora registrada automáticamente." },
  { title: "Permanencia", description: "Cálculo automático del tiempo y la tarifa que corresponde." },
  { title: "Salida y pago", description: "Efectivo, débito, crédito, transferencia o pagos combinados." },
  { title: "Ticket con código QR", description: "Un comprobante para cada operación." },
];

const PANEL_SECTIONS = ["Resumen", "Operaciones", "Cajas", "Reportes", "Usuarios"];

const PANEL_FEATURES = [
  "Operaciones en tiempo real",
  "Indicadores de gestión",
  "Ingresos y recaudación",
  "Historial de vehículos y pagos",
  "Reportes administrativos",
  "Tarifas y horarios",
  "Control de cajas y turnos",
  "Incidencias y anulaciones",
];

const ROLES = [
  { title: "Propietario / Administrador", description: "Acceso total, configuración y autorización de operaciones sensibles." },
  { title: "Supervisor", description: "Control de cajas, turnos e incidencias." },
  { title: "Operador", description: "Registra entradas, salidas y pagos con su propia cuenta." },
];

const CUSTOMIZATION = [
  "Nombre e identidad visual propia",
  "Aplicación personalizada",
  "Panel web con imagen corporativa",
  "Base de datos independiente",
  "Tarifas y horarios configurables",
  "Reglas adaptadas a tu negocio",
  "Usuarios y permisos propios",
];

function DownloadApkButton({ apkUrl, className }: { apkUrl: string; className?: string }) {
  if (apkUrl) {
    return (
      <NSButton href={apkUrl} target="_blank" rel="noopener noreferrer" size="lg" className={className}>
        Descargar APK demo
      </NSButton>
    );
  }
  return (
    <NSButton size="lg" disabled className={className}>
      APK demo próximamente
    </NSButton>
  );
}

export default async function EstacionamientoPage() {
  const settings = await getPlatformSettings();
  const supportNumber = settings.supportWhatsappNumber;

  return (
    <div className="ds-landing-dark min-h-dvh bg-ink-950 text-ink-0">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg uppercase tracking-wide">DS Studio</span>
        <NSButton href="/" variant="ghost" size="sm">
          ← DS Catalog
        </NSButton>
      </header>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Propuesta comercial · DS Studio</p>
        <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">
          Sistema inteligente de gestión de estacionamientos
        </h1>
        <p className="max-w-xl text-sm text-ink-300 sm:text-base">
          Una app móvil y un panel web que conectan la operación diaria con el control administrativo — ya
          implementado y en funcionamiento en varios estacionamientos. Faltas tú.
        </p>
        <DownloadApkButton apkUrl={settings.apkUrl} />
      </main>

      <section className="border-t border-ink-800 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <NSReveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">El desafío</p>
            <p className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
              Lo que suele complicar la administración de un estacionamiento
            </p>
          </NSReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CHALLENGES.map((item, index) => (
              <NSReveal key={item.title} delay={index * 0.06}>
                <div className="flex h-full flex-col gap-2 rounded-card border border-ink-800 bg-ink-900 p-6">
                  <p className="font-display text-base uppercase tracking-wide text-accent">{item.title}</p>
                  <p className="text-sm text-ink-300">{item.description}</p>
                </div>
              </NSReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-800 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <NSReveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">La solución</p>
            <p className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
              Un sistema que conecta la operación con la administración
            </p>
          </NSReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <NSReveal key={pillar.title} delay={index * 0.08}>
                <NSSpotlightCard className="flex h-full flex-col gap-2 rounded-card border border-ink-800 bg-ink-900 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-accent/40">
                  <p className="font-display text-lg uppercase tracking-wide text-accent">{pillar.title}</p>
                  <p className="text-sm text-ink-300">{pillar.description}</p>
                </NSSpotlightCard>
              </NSReveal>
            ))}
          </div>
          <p className="mt-8 text-center text-xs uppercase tracking-wide text-ink-500">
            Referencia: sistema ya implementado y en funcionamiento en <span className="text-accent">PARKEALO</span>
          </p>
        </div>
      </section>

      <section className="border-t border-ink-800 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <NSReveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Aplicación móvil</p>
            <p className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
              La operación diaria, en la palma de la mano
            </p>
          </NSReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {APP_STEPS.map((step, index) => (
              <NSReveal key={step.title} delay={index * 0.06}>
                <div className="flex h-full gap-4 rounded-card border border-ink-800 bg-ink-900 p-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-accent text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-display text-base uppercase tracking-wide">{step.title}</p>
                    <p className="mt-1 text-sm text-ink-300">{step.description}</p>
                  </div>
                </div>
              </NSReveal>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-ink-400">
            <span className="rounded-pill border border-ink-800 px-4 py-2">Historial de vehículos y operaciones</span>
            <span className="rounded-pill border border-ink-800 px-4 py-2">Funciona sin internet y sincroniza después</span>
          </div>
        </div>
      </section>

      <section className="border-t border-ink-800 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <NSReveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Panel administrativo web</p>
            <p className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
              Todo el negocio, visible desde cualquier lugar
            </p>
          </NSReveal>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {PANEL_SECTIONS.map((section) => (
              <span key={section} className="rounded-pill border border-ink-800 bg-ink-900 px-4 py-2 text-xs text-ink-300">
                {section}
              </span>
            ))}
          </div>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-x-8 gap-y-2 text-sm text-ink-300 sm:grid-cols-2">
            {PANEL_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-ink-800 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <NSReveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Seguridad y datos</p>
            <p className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
              Usuarios, seguridad y base de datos
            </p>
          </NSReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {ROLES.map((role, index) => (
              <NSReveal key={role.title} delay={index * 0.08}>
                <div className="flex h-full flex-col gap-2 rounded-card border border-ink-800 bg-ink-900 p-6">
                  <p className="font-display text-base uppercase tracking-wide text-accent">{role.title}</p>
                  <p className="text-sm text-ink-300">{role.description}</p>
                </div>
              </NSReveal>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-ink-400">
            Registro de actividad y auditoría: cada acción queda asociada al usuario que la realizó, con historial por
            matrícula, visitas anteriores, operaciones y pagos centralizados.
          </p>
        </div>
      </section>

      <section className="border-t border-ink-800 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <NSReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Personalización</p>
            <p className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
              Un sistema propio, no una plataforma compartida
            </p>
          </NSReveal>
          <ul className="mx-auto mt-8 grid max-w-md gap-2 text-left text-sm text-ink-300">
            {CUSTOMIZATION.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-display text-lg uppercase tracking-wide text-accent">
            Un sistema configurado para tu propia empresa.
          </p>
        </div>
      </section>

      <section className="border-t border-ink-800 bg-ink-900/40 py-16 text-center">
        <NSReveal className="mx-auto max-w-xl px-6">
          <p className="font-display text-2xl uppercase tracking-wide sm:text-3xl">
            Tu estacionamiento merece una gestión más inteligente.
          </p>
          <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
            <DownloadApkButton apkUrl={settings.apkUrl} />
            {supportNumber ? (
              <NSWhatsAppButton
                whatsappNumber={supportNumber}
                message="Hola, vi la demo del sistema de estacionamientos y quiero cotizarlo."
              >
                Cotizar por WhatsApp
              </NSWhatsAppButton>
            ) : null}
          </div>
        </NSReveal>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center text-xs text-ink-500">
        <p>DS Studio · Desarrollo de soluciones tecnológicas a medida</p>
      </footer>
    </div>
  );
}
