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

export function NSHeaderClient({
  tenantSlug,
  parents,
  whatsappNumber,
  logoSrc,
  brandName,
  tagline,
}: {
  tenantSlug: string;
  parents: NavParentCategory[];
  whatsappNumber: string;
  logoSrc?: string;
  brandName: string;
  tagline: string;
}) {
  const base = `/${tenantSlug}`;
  const NAV_LINKS = [
    { href: base, label: "Inicio" },
    { href: `${base}/catalogo`, label: "Catálogo" },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const pathname = usePathname();

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
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-normal",
          scrolled
            ? "border-ink-800 bg-ink-950/95 backdrop-blur-md"
            : "border-transparent bg-ink-950",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href={base} className="flex items-center gap-3 text-ink-0" aria-label="Inicio">
            <NSLogo
              id="ns-header"
              variant="mark"
              className="h-10 w-10 sm:h-12 sm:w-12"
              src={logoSrc}
              brandName={brandName}
              tagline={tagline}
            />
            <span className="hidden font-display text-lg uppercase tracking-wide sm:block">
              {brandName}
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-widest text-ink-200 transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-ink-200 transition-colors hover:text-accent"
                onClick={() => setCollectionsOpen((v) => !v)}
              >
                Colecciones
                <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 7.5l4.5 4.5 4.5-4.5" />
                </svg>
              </button>
              <AnimatePresence>
                {collectionsOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full grid w-[32rem] -translate-x-1/2 grid-cols-4 gap-x-5 gap-y-4 rounded-card border border-ink-800 bg-ink-900 p-5 shadow-modal"
                  >
                    {parents.map((parent) => (
                      <div key={parent.slug} className="flex flex-col gap-2">
                        <Link
                          href={`${base}/${parent.slug}`}
                          className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline"
                        >
                          {parent.name}
                        </Link>
                        <div className="flex flex-col gap-1.5">
                          {parent.children.map((child) => (
                            <Link
                              key={child.slug}
                              href={`${base}/${child.slug}`}
                              className="text-xs font-medium uppercase tracking-wide text-ink-300 hover:text-accent"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <Link
              href={`${base}#contacto`}
              className="text-xs font-semibold uppercase tracking-widest text-ink-200 transition-colors hover:text-accent"
            >
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-1 text-ink-0 sm:gap-2">
            <button
              type="button"
              aria-label="Buscar"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-control transition-colors hover:bg-ink-800"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <circle cx="9" cy="9" r="6" />
                <path strokeLinecap="round" d="m17 17-3.5-3.5" />
              </svg>
            </button>
            <div className="[&_button]:text-ink-0 [&_button:hover]:bg-ink-800">
              <NSCartButton />
            </div>
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-control transition-colors hover:bg-ink-800 lg:hidden"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink-950 text-ink-0 lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <NSLogo
                id="ns-mobile"
                variant="mark"
                className="h-10 w-10"
                src={logoSrc}
                brandName={brandName}
                tagline={tagline}
              />
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-control hover:bg-ink-800"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b border-ink-800 py-4 font-display text-2xl uppercase tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
              <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-accent">
                Colecciones
              </p>
              {parents.map((parent) => (
                <div key={parent.slug} className="border-b border-ink-800 py-3">
                  <Link
                    href={`${base}/${parent.slug}`}
                    className="block text-sm font-semibold uppercase tracking-wide text-ink-0"
                  >
                    {parent.name}
                  </Link>
                  {parent.children.length > 0 ? (
                    <div className="mt-2 flex flex-col gap-2 pl-3">
                      {parent.children.map((child) => (
                        <Link
                          key={child.slug}
                          href={`${base}/${child.slug}`}
                          className="text-sm font-medium uppercase tracking-wide text-ink-300"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex h-12 items-center justify-center rounded-control bg-accent text-sm font-semibold uppercase tracking-wide text-accent-foreground"
              >
                Escríbenos por WhatsApp
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <NSSearchOverlay base={base} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NSSearchOverlay({ base, open, onClose }: { base: string; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-ink-950/98 px-6 pt-24 text-ink-0 backdrop-blur-sm sm:pt-40"
        >
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-control hover:bg-ink-800"
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
              onClose();
            }}
          >
            <label htmlFor="ns-search-input" className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
              Buscar en el catálogo
            </label>
            <div className="flex items-center gap-3 border-b-2 border-ink-700 pb-3 focus-within:border-accent">
              <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0 text-ink-400" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <circle cx="9" cy="9" r="6" />
                <path strokeLinecap="round" d="m17 17-3.5-3.5" />
              </svg>
              <input
                id="ns-search-input"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Skinny, NS-001, cargo..."
                className="w-full bg-transparent font-display text-3xl uppercase tracking-wide text-ink-0 placeholder:text-ink-600 focus:outline-none sm:text-4xl"
              />
            </div>
          </form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
