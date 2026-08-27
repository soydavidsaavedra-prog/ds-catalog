"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NSLogo } from "@/components/brand/NSLogo";
import { NSCartButton } from "@/components/cart/NSCartButton";
import { cn } from "@/lib/utils/cn";

interface NavCategory {
  slug: string;
  name: string;
}

interface NavParentCategory extends NavCategory {
  children: NavCategory[];
}

/**
 * Theme Ferrecol's header — a flat, boutique-style nav (no mega-menu):
 * Inicio, a single "Categorías" dropdown built from the tenant's real
 * category tree, and Catálogo. Search/cart/mobile drawer follow the same
 * interaction pattern as Theme 01's header (proven UX, not brand-specific)
 * but with Ferrecol's own dark-carbon/orange visual language.
 */
export function HeaderClient({
  tenantSlug,
  parents,
  brandName,
  logoSrc,
  tagline,
}: {
  tenantSlug: string;
  parents: NavParentCategory[];
  brandName: string;
  logoSrc?: string;
  tagline: string;
}) {
  const base = `/${tenantSlug}`;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-normal",
        scrolled ? "border-border bg-background/95 backdrop-blur-md" : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href={base} className="flex items-center gap-3" aria-label="Inicio">
          <NSLogo id="ferrecol-header" variant="mark" className="h-10 w-10 sm:h-11 sm:w-11" src={logoSrc} brandName={brandName} tagline={tagline} />
          <span className="hidden text-lg font-semibold tracking-tight sm:block">{brandName}</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href={base} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Inicio
          </Link>
          <div className="relative" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}>
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setCategoriesOpen((v) => !v)}
            >
              Categorías
              <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 7.5l4.5 4.5 4.5-4.5" />
              </svg>
            </button>
            <AnimatePresence>
              {categoriesOpen && parents.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full grid w-64 -translate-x-1/2 gap-1 rounded-card border border-border bg-surface-elevated p-3 shadow-modal"
                >
                  {parents.map((parent) => (
                    <Link
                      key={parent.slug}
                      href={`${base}/${parent.slug}`}
                      className="rounded-control px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface hover:text-accent"
                    >
                      {parent.name}
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <Link href={`${base}/catalogo`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Productos
          </Link>
          <Link href={`${base}#contacto`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Buscar"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-control text-foreground transition-colors hover:bg-surface"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="9" cy="9" r="6" />
              <path strokeLinecap="round" d="m17 17-3.5-3.5" />
            </svg>
          </button>
          <NSCartButton />
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-control text-foreground transition-colors hover:bg-surface lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-background text-foreground lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <NSLogo id="ferrecol-mobile" variant="mark" className="h-9 w-9" src={logoSrc} brandName={brandName} tagline={tagline} />
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-control hover:bg-surface"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6">
              <Link href={base} className="border-b border-border py-3.5 text-lg font-semibold">Inicio</Link>
              <Link href={`${base}/catalogo`} className="border-b border-border py-3.5 text-lg font-semibold">Productos</Link>
              {parents.length > 0 ? (
                <>
                  <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-accent">Categorías</p>
                  {parents.map((parent) => (
                    <Link key={parent.slug} href={`${base}/${parent.slug}`} className="border-b border-border py-3 text-sm font-medium">
                      {parent.name}
                    </Link>
                  ))}
                </>
              ) : null}
              <Link href={`${base}#contacto`} className="py-3.5 text-lg font-semibold">Contacto</Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/98 px-6 pt-24 backdrop-blur-sm sm:pt-40"
          >
            <button
              type="button"
              aria-label="Cerrar búsqueda"
              onClick={() => setSearchOpen(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-control hover:bg-surface"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
            <form
              className="mx-auto w-full max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (!query.trim()) return;
                router.push(`${base}/catalogo?q=${encodeURIComponent(query.trim())}`);
                setSearchOpen(false);
              }}
            >
              <label htmlFor="ferrecol-search-input" className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
                Buscar productos
              </label>
              <div className="flex items-center gap-3 border-b-2 border-border-strong pb-3 focus-within:border-accent">
                <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                  <circle cx="9" cy="9" r="6" />
                  <path strokeLinecap="round" d="m17 17-3.5-3.5" />
                </svg>
                <input
                  id="ferrecol-search-input"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Taladro, cemento, referencia..."
                  className="w-full bg-transparent text-2xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-3xl"
                />
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
