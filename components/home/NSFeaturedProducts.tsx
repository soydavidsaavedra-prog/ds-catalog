"use client";

import { useState } from "react";
import type { Product } from "@/lib/types/catalog";
import { NSSectionHeading } from "@/components/ui/NSSectionHeading";
import { NSProductGrid } from "@/components/catalog/NSProductGrid";
import { NSButton } from "@/components/ui/NSButton";
import { cn } from "@/lib/utils/cn";

type TabKey = "nuevos" | "destacados" | "ofertas";

const TABS: { key: TabKey; label: string }[] = [
  { key: "nuevos", label: "Nuevos" },
  { key: "destacados", label: "Destacados" },
  { key: "ofertas", label: "Ofertas" },
];

export function NSFeaturedProducts({
  nuevos,
  destacados,
  ofertas,
}: {
  nuevos: Product[];
  destacados: Product[];
  ofertas: Product[];
}) {
  const [tab, setTab] = useState<TabKey>("nuevos");
  const byTab: Record<TabKey, Product[]> = { nuevos, destacados, ofertas };
  const active = byTab[tab].slice(0, 8);

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NSSectionHeading
          eyebrow="Selección"
          title="Productos destacados"
          action={
            <NSButton href="/catalogo" variant="outline" size="sm">
              Ver catálogo completo
            </NSButton>
          }
        />

        <div className="mt-8 flex gap-6 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative pb-3 text-xs font-semibold uppercase tracking-widest transition-colors",
                tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.key ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <NSProductGrid
            products={active}
            emptyTitle="Muy pronto"
            emptyDescription="Estamos preparando esta selección."
          />
        </div>
      </div>
    </section>
  );
}
