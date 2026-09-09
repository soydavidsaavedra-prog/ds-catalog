import type { ReactNode } from "react";
import Link from "next/link";
import type { ThemeHomeProps } from "@/lib/themes/types";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSButton } from "@/components/ui/NSButton";
import { NSReveal } from "@/components/ui/NSReveal";
import { Hero } from "./Hero";
import { BrandStatement } from "./BrandStatement";
import { ProductGrid } from "./ProductGrid";

const TRUST_BAR: { title: string; description: string; icon: ReactNode }[] = [
  { title: "Calidad garantizada", description: "Productos seleccionados de las mejores marcas", icon: <ShieldIcon /> },
  { title: "Envíos rápidos", description: "Entregas a domicilio en tiempo récord", icon: <TruckIcon /> },
  { title: "Asesoría experta", description: "Te ayudamos a elegir lo que necesitas", icon: <HeadsetIcon /> },
  { title: "Pagos seguros", description: "Múltiples métodos de pago disponibles", icon: <CardIcon /> },
];

const TRUST_STRIP = [
  { title: "Marcas líderes", description: "Trabajamos con las mejores marcas" },
  { title: "Atención personalizada", description: "Soporte y asesoría en cada compra" },
  { title: "Garantía de satisfacción", description: "Tu satisfacción es nuestra prioridad" },
  { title: "Compra fácil y segura", description: "Proceso simple, rápido y protegido" },
];

/**
 * Theme 02's home composition — a boxed/card-based ecommerce layout (inset
 * hero card, bordered trust panel, tile-grid categories) rather than Theme
 * 01's full-bleed editorial one; that boxed language is Theme 02's whole
 * visual identity, not a color swap over the same shapes. Every section
 * reads real tenant data; nothing here is fixed to any one brand. Nuevos
 * ingresos, the brand-statement split, and Ofertas each render only when
 * there's real content behind them (a product actually marked "Nuevo"/
 * "Oferta", or the tenant having filled in /admin/inicio's statement
 * fields) — never shown empty just to fill space.
 */
export function Home({ tenantSlug, settings, categories, products, heroSlides }: ThemeHomeProps) {
  const base = `/${tenantSlug}`;
  const heroMedia = heroSlides[0]?.mediaUrl ?? settings.heroImage;
  const heroPositionX = heroSlides[0]?.positionX ?? settings.heroImagePositionX;
  const heroPositionY = heroSlides[0]?.positionY ?? settings.heroImagePositionY;

  const topLevelCategories = categories.filter((c) => c.parentId === null && c.featured);
  const destacados = products.filter((p) => p.featured);
  const nuevos = products.filter((p) => p.isNew);
  const ofertas = products.filter((p) => p.onSale);
  const paymentBadge = { icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel };
  const hasStatement = Boolean(settings.statementTitleLine1 || settings.statementDescription);

  return (
    <>
      {/* Hero — an inset, rounded photo card (not full-bleed), text overlaid on its own gradient. */}
      <section className="bg-background px-4 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Hero
            eyebrow={settings.heroEyebrow}
            titleLine1={settings.heroTitleLine1}
            titleLine2={settings.heroTitleLine2}
            subtitle={settings.heroSubtitle}
            ctaLabel={settings.heroCtaLabel}
            ctaHref={settings.heroCtaHref.startsWith("/") ? `${base}${settings.heroCtaHref}` : settings.heroCtaHref}
            image={heroMedia}
            imagePositionX={heroPositionX}
            imagePositionY={heroPositionY}
            brandName={settings.brandName}
          />

          {/* Trust bar — its own bordered panel directly under the hero card, hairline dividers between cells. */}
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {TRUST_BAR.map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-surface p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías principales */}
      {topLevelCategories.length > 0 ? (
        <section id="categorias" className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Categorías <span className="text-accent">principales</span>
              </h2>
              <Link href={`${base}/catalogo`} className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-4">
              {topLevelCategories.map((category, index) => (
                <NSReveal key={category.slug} delay={index * 0.06}>
                  <Link href={`${base}/${category.slug}`} className="group flex flex-col items-center gap-2.5 text-center">
                    <span className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface">
                      <NSMedia src={category.image} alt={category.name} className="h-full w-full transition-transform duration-slower ease-out-ns group-hover:scale-105" brandName={settings.brandName} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground">{category.name}</span>
                  </Link>
                </NSReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Productos destacados */}
      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Productos <span className="text-accent">destacados</span>
            </h2>
            <Link href={`${base}/catalogo`} className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline">
              Ver catálogo →
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid
              tenantSlug={tenantSlug}
              products={destacados.slice(0, 8)}
              emptyTitle="Muy pronto"
              emptyDescription="Estamos preparando esta selección."
              paymentBadge={paymentBadge}
              brandName={settings.brandName}
            />
          </div>
        </div>
      </section>

      {/* Nuevos ingresos — only shown when there's a real product marked "Nuevo" */}
      {nuevos.length > 0 ? (
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Nuevos <span className="text-accent">ingresos</span>
              </h2>
              <Link href={`${base}/catalogo`} className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline">
                Ver catálogo →
              </Link>
            </div>
            <div className="mt-8">
              <ProductGrid tenantSlug={tenantSlug} products={nuevos.slice(0, 8)} paymentBadge={paymentBadge} brandName={settings.brandName} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Declaración de marca — real per-tenant content (editable en /admin/inicio), only shown when the tenant actually filled it in. */}
      {hasStatement ? (
        <section className="border-t border-border bg-surface">
          <BrandStatement
            titleLine1={settings.statementTitleLine1}
            titleLine2={settings.statementTitleLine2}
            description={settings.statementDescription}
            image={settings.statementImage}
            brandName={settings.brandName}
          />
        </section>
      ) : null}

      {/* Ofertas — only shown when there's a real discounted product behind it */}
      {ofertas.length > 0 ? (
        <section className="bg-background py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-5 rounded-3xl border border-accent/30 bg-accent/10 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <TagIcon />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">Ofertas especiales</p>
                  <p className="mt-1 text-xl font-bold text-foreground">Descuentos exclusivos en productos seleccionados.</p>
                </div>
              </div>
              <NSButton href={`${base}/catalogo`} size="lg">
                Ver ofertas
              </NSButton>
            </div>
          </div>
        </section>
      ) : null}

      {/* Trust strip de cierre */}
      <section className="border-t border-border bg-surface py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {TRUST_STRIP.map((item) => (
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 2.5 16.5 5v4.2c0 4-2.7 7.1-6.5 8.3-3.8-1.2-6.5-4.3-6.5-8.3V5L10 2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m7.2 10 1.9 1.9L13 8" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 5h8v8H2zM10 8h4l3 3v2h-7z" />
      <circle cx="6" cy="15.5" r="1.4" />
      <circle cx="14.5" cy="15.5" r="1.4" />
    </svg>
  );
}
function HeadsetIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" d="M3 11v-1a7 7 0 0 1 14 0v1" />
      <rect x="2.2" y="10.5" width="3.2" height="4.5" rx="1" />
      <rect x="14.6" y="10.5" width="3.2" height="4.5" rx="1" />
      <path strokeLinecap="round" d="M17.8 15v.5a2.5 2.5 0 0 1-2.5 2.5H12" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2.2" y="4.5" width="15.6" height="11" rx="1.6" />
      <path strokeLinecap="round" d="M2.2 8h15.6" />
      <path strokeLinecap="round" d="M5 13h4" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 8.5 9.5 1.5H16a1.5 1.5 0 0 1 1.5 1.5v6.5L10.5 17a1.5 1.5 0 0 1-2.1 0L2.5 11a1.5 1.5 0 0 1 0-2.5Z" />
      <circle cx="12.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
