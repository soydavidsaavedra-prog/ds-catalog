"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCartStore, useCartTotal } from "@/lib/cart/cart-store";
import { cartItemKey } from "@/lib/types/cart";
import { NSCartItemRow } from "./NSCartItemRow";
import { NSButton } from "@/components/ui/NSButton";
import { formatPrice } from "@/lib/utils/format";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp/order-message";

export function NSCartDrawer({
  tenantSlug,
  whatsappNumber,
  brandName,
}: {
  tenantSlug: string;
  whatsappNumber: string;
  brandName?: string;
}) {
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const closeCart = useCartStore((s) => s.closeCart);
  const total = useCartTotal();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--overlay)]"
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            key="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.2, 0, 0, 1] }}
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-surface-elevated shadow-modal"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-xl uppercase tracking-wide">Carrito</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="flex h-9 w-9 items-center justify-center rounded-control hover:bg-surface"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
                  <NSButton href={`/${tenantSlug}/catalogo`} variant="outline" size="sm" onClick={closeCart}>
                    Ver catálogo
                  </NSButton>
                </div>
              ) : (
                items.map((item) => <NSCartItemRow key={cartItemKey(item)} item={item} brandName={brandName} />)
              )}
            </div>

            {items.length > 0 ? (
              <footer className="border-t border-border px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Total
                  </span>
                  <span className="text-xl font-bold">{formatPrice(total)}</span>
                </div>
                <a
                  href={buildWhatsAppOrderUrl(items, whatsappNumber, tenantSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-control bg-accent text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-strong"
                >
                  Enviar pedido por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-3 w-full text-center text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                  Continuar comprando
                </button>
              </footer>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
