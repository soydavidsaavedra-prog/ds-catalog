"use client";

import Link from "next/link";
import { NSMedia } from "@/components/ui/NSMedia";
import { NSBadge } from "@/components/ui/NSBadge";
import { NSPrice } from "@/components/ui/NSPrice";
import { NSButton } from "@/components/ui/NSButton";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSEmptyState } from "@/components/ui/NSEmptyState";
import { useWishlistStore } from "@/lib/wishlist/wishlist-store";
import { CARD_ASPECT_RATIO_CLASSES } from "@/components/storefront/themes/theme-01/NSProductCard";

/**
 * Theme-agnostic — built from shared UI atoms (NSMedia/NSBadge/NSPrice),
 * same reasoning as NSCartDrawer/NSToast: it reskins correctly under
 * whichever `.theme-0X` scope the storefront layout wraps it in, with no
 * per-theme variant needed. Links straight to the product page rather than
 * offering add-to-cart here — the wishlist snapshot (price/stock at the
 * time it was saved) can go stale, so buying always goes through the real,
 * current product data.
 */
export function NSFavoritesView({ tenantSlug, currency }: { tenantSlug: string; currency?: string }) {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <NSSectionHeading
        eyebrow="Tu selección"
        title="Favoritos"
        description={
          items.length > 0
            ? `${items.length} producto${items.length === 1 ? "" : "s"} guardado${items.length === 1 ? "" : "s"}`
            : undefined
        }
      />

      {items.length === 0 ? (
        <NSEmptyState
          className="mt-10"
          title="Favoritos vacíos"
          description="Todavía no guardaste ningún producto — toca el corazón en la tarjeta de un producto para guardarlo aquí."
          action={
            <NSButton href={`/${tenantSlug}/catalogo`} variant="outline">
              Ver catálogo
            </NSButton>
          }
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col">
              <Link
                href={`/${tenantSlug}/producto/${item.slug}`}
                className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong"
              >
                <div
                  className={`relative overflow-hidden rounded-card bg-ink-900 ${CARD_ASPECT_RATIO_CLASSES[item.cardAspectRatio]}`}
                >
                  <NSMedia
                    src={item.image}
                    alt={item.name}
                    reference={item.reference}
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                    objectFit={item.imageFit}
                  />
                  <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
                    {item.isNew ? <NSBadge tone="gold">Nuevo</NSBadge> : null}
                    {item.onSale ? <NSBadge tone="danger">Oferta</NSBadge> : null}
                  </div>
                  {item.availability === "out_of_stock" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
                      <NSBadge tone="outline" className="border-ink-0 text-ink-0">
                        Agotado
                      </NSBadge>
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.reference}</p>
                  <NSPrice amount={item.price} compareAt={item.previousPrice} currency={currency} />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => remove(item.productId)}
                className="mt-2 self-start text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-danger"
              >
                Quitar de favoritos
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
