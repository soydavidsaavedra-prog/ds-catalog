"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useQuickViewStore } from "@/lib/quickview/quickview-store";
import { NSProductGallery } from "@/components/storefront/themes/theme-01/NSProductGallery";
import { NSProductPurchasePanel } from "@/components/storefront/themes/theme-01/NSProductPurchasePanel";

/**
 * "Ver producto sin salir del listado" — a centered modal reusing the exact
 * same gallery + purchase panel as the full product page (both already
 * shared by theme-01 and theme-02, see ProductDetail.tsx in each theme), so
 * variant selection, stock, discount, share and the add-to-cart toast all
 * behave identically here. Mounted once in the storefront layout; opened by
 * NSQuickViewStore.open() from either theme's product card.
 */
export function NSQuickViewModal() {
  const context = useQuickViewStore((s) => s.context);
  const close = useQuickViewStore((s) => s.close);

  useEffect(() => {
    if (!context) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [context, close]);

  return (
    <AnimatePresence>
      {context ? (
        <>
          <motion.div
            key="quickview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--overlay)]"
            onClick={close}
            aria-hidden
          />
          <motion.div
            key="quickview-panel"
            role="dialog"
            aria-modal="true"
            aria-label={context.product.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-x-0 bottom-0 top-auto z-50 max-h-[92dvh] overflow-y-auto rounded-t-card bg-surface-elevated p-5 shadow-modal sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[88dvh] sm:w-[92vw] sm:max-w-4xl sm:rounded-card sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar vista rápida"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-control bg-surface hover:bg-border"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>

            <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
              <NSProductGallery
                images={context.product.images}
                reference={context.product.reference}
                name={context.product.name}
                brandName={context.brandName}
                cardAspectRatio={context.product.cardAspectRatio}
                imageFit={context.product.imageFit}
              />
              <div>
                <NSProductPurchasePanel
                  tenantSlug={context.tenantSlug}
                  product={context.product}
                  paymentBadge={context.paymentBadge}
                  brandName={context.brandName}
                  currency={context.currency}
                />
                <Link
                  href={`/${context.tenantSlug}/producto/${context.product.slug}`}
                  onClick={close}
                  className="mt-5 inline-block text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                  Ver página completa del producto →
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
