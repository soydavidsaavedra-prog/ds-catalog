import Link from "next/link";
import type { ThemeHomeProps } from "@/lib/themes/types";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSButton } from "@/components/ui/NSButton";
import { NSReveal } from "@/components/ui/NSReveal";
import { ProductGrid } from "./ProductGrid";

const TRUST_BAR = [
  { title: "Calidad garantizada", description: "Productos seleccionados de las mejores marcas" },
  { title: "Envíos rápidos", description: "Entregas a domicilio en tiempo récord" },
  { title: "Asesoría experta", description: "Te ayudamos a elegir lo que necesitas" },
  { title: "Pagos seguros", description: "Múltiples métodos de pago disponibles" },
];

const TRUST_STRIP = [
  { title: "Marcas líderes", description: "Trabajamos con las mejores marcas" },
  { title: "Atención personalizada", description: "Soporte y asesoría en cada compra" },
  { title: "Garantía de satisfacción", description: "Tu satisfacción es nuestra prioridad" },
  { title: "Compra fácil y segura", description: "Proceso simple, rápido y protegido" },
];

/**
 * Theme Ferrecol's home composition — Hero, trust bar, categories,
 * destacados, an offers banner (only when there's a real onSale product
 * behind it), and a closing trust strip. Every section reads real tenant
 * data (settings/categories/products); nothing here is fixed to any one
 * brand — "Ferrecol" itself never appears in this file.
 */
export function Home({ tenantSlug, settings, categories, products, heroSlides }: ThemeHomeProps) {
  const base = `/${tenantSlug}`;
  const heroMedia = heroSlides[0]?.mediaUrl ?? settings.heroImage;
  const heroPositionX = heroSlides[0]?.positionX ?? settings.heroImagePositionX;
  const heroPositionY = heroSlides[0]?.positionY ?? settings.heroImagePositionY;

  const topLevelCategories = categories.filter((c) => c.parentId === null && c.featured);
  const destacados = products.filter((p) => p.featured);
  const ofertas = products.filter((p) => p.onSale);
  const paymentBadge = { icon: settings.paymentBadgeIcon, label: settings.paymentBadgeLabel };

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[85vh] min-h-[560px] w-full items-end overflow-hidden bg-background sm:h-screen sm:max-h-[900px]">
        <div className="absolute inset-0">
          <NSMedia
            src={heroMedia}
            alt={`${settings.heroTitleLine1} ${settings.heroTitleLine2}`}
            priority
            className="h-full w-full"
            objectPosition={`${heroPositionX}% ${heroPositionY}%`}
            brandName={settings.brandName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          {settings.heroEyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{settings.heroEyebrow}</p>
          ) : null}
          <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            <span className="block">{settings.heroTitleLine1}</span>
            <span className="block text-accent">{settings.heroTitleLine2}</span>
          </h1>
          {settings.heroSubtitle ? (
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">{settings.heroSubtitle}</p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <NSButton href={settings.heroCtaHref.startsWith("/") ? `${base}${settings.heroCtaHref}` : settings.heroCtaHref} size="lg">
              {settings.heroCtaLabel || "Ver productos"}
            </NSButton>
            <NSButton href="#categorias" variant="outline" size="lg">
              Ver categorías
            </NSButton>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {TRUST_BAR.map((item) => (
            <div key={item.title} className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
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
                    <span className="relative block aspect-square w-full overflow-hidden rounded-card border border-border bg-surface">
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

      {/* Ofertas — only shown when there's a real discounted product behind it */}
      {ofertas.length > 0 ? (
        <section className="bg-background py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-5 rounded-card border border-accent/30 bg-accent/10 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">Ofertas especiales</p>
                <p className="mt-1 text-xl font-bold text-foreground">Descuentos exclusivos en productos seleccionados.</p>
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
