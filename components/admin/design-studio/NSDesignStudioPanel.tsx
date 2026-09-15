"use client";

import type { Dispatch, SetStateAction } from "react";
import { DSCard } from "@/components/ui/DSCard";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";
import { NSButton } from "@/components/ui/NSButton";
import { NSEmptyState } from "@/components/ui/NSEmptyState";
import { updateTenantThemeAction } from "@/app/[tenant]/admin/actions";
import { THEME_META } from "@/lib/themes/types";
import type { ThemeKey } from "@/lib/types/tenant";
import { cn } from "@/lib/utils/cn";
import { NSHeroFieldsEditor, type HeroDraft } from "@/components/admin/design-studio/NSHeroFieldsEditor";
import { NSStatementFieldsEditor, type StatementDraft } from "@/components/admin/design-studio/NSStatementFieldsEditor";
import { NSStoryFieldsEditor, type StoryDraft } from "@/components/admin/design-studio/NSStoryFieldsEditor";

interface InfoSection {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

/**
 * Sections driven entirely by existing data/rules (products flagged
 * "Nuevo"/"Oferta", categories marked destacada, active testimonials) —
 * not editable in-panel, since that would rebuild three CRUD systems that
 * already work well as their own admin pages. Clicking one of these
 * regions on the canvas just explains the rule and links to where it's
 * actually managed.
 */
function buildInfoSections(base: string): Record<string, InfoSection> {
  return {
    collections: {
      title: "Categorías destacadas",
      description: "Se arma con las categorías que marcaste como destacadas.",
      href: `${base}/categorias`,
      ctaLabel: "Gestionar categorías",
    },
    "featured-products": {
      title: "Productos destacados",
      description: "Se arma automáticamente con tus productos más recientes.",
      href: `${base}/productos`,
      ctaLabel: "Gestionar productos",
    },
    "new-arrivals": {
      title: "Nuevos ingresos",
      description: 'Se arma con los productos que marques como "Nuevo" al editarlos.',
      href: `${base}/productos`,
      ctaLabel: "Gestionar productos",
    },
    offers: {
      title: "Ofertas",
      description: "Se arma con los productos que tengan un precio anterior (en oferta).",
      href: `${base}/productos`,
      ctaLabel: "Gestionar productos",
    },
    testimonials: {
      title: "Testimonios",
      description: "Se arma con los testimonios que actives.",
      href: `${base}/testimonios`,
      ctaLabel: "Gestionar testimonios",
    },
  };
}

export function NSDesignStudioPanel({
  tenantId,
  tenantSlug,
  selectedId,
  heroDraft,
  setHeroDraft,
  storyDraft,
  setStoryDraft,
  statementDraft,
  setStatementDraft,
  activeTheme,
  setActiveTheme,
  savedTheme,
  allowedThemes,
}: {
  tenantId: string;
  tenantSlug: string;
  selectedId: string | null;
  heroDraft: HeroDraft;
  setHeroDraft: Dispatch<SetStateAction<HeroDraft>>;
  storyDraft: StoryDraft;
  setStoryDraft: Dispatch<SetStateAction<StoryDraft>>;
  statementDraft: StatementDraft;
  setStatementDraft: Dispatch<SetStateAction<StatementDraft>>;
  activeTheme: ThemeKey;
  setActiveTheme: (theme: ThemeKey) => void;
  savedTheme: ThemeKey;
  allowedThemes: ThemeKey[] | null;
}) {
  const base = `/${tenantSlug}/admin`;
  const infoSections = buildInfoSections(base);
  const previewingUnsavedTheme = activeTheme !== savedTheme;
  const activeThemeAllowed = !allowedThemes || allowedThemes.includes(activeTheme);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <DSCard title="Tema de la tienda">
        <div className="flex flex-col gap-3">
          {Object.values(THEME_META).map((meta) => {
            const isPreviewed = meta.key === activeTheme;
            const isSaved = meta.key === savedTheme;
            const allowed = !allowedThemes || allowedThemes.includes(meta.key);
            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => setActiveTheme(meta.key)}
                className={cn(
                  "rounded-control border px-4 py-3 text-left transition-colors",
                  isPreviewed ? "border-accent-strong bg-accent/5" : "border-border hover:border-border-strong",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                  {isSaved ? (
                    <DSStatusBadge label="Activo" tone="success" />
                  ) : !allowed ? (
                    <DSStatusBadge label="No incluido en tu plan" tone="muted" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
              </button>
            );
          })}
        </div>
        {previewingUnsavedTheme ? (
          activeThemeAllowed ? (
            <form action={updateTenantThemeAction.bind(null, tenantId, tenantSlug, activeTheme)} className="mt-4">
              <NSButton type="submit" size="sm">
                Aplicar este tema a tu tienda
              </NSButton>
            </form>
          ) : (
            <NSButton href={`${base}/cuenta#plan-uso`} variant="outline" size="sm" className="mt-4">
              Mejorar mi plan para usarlo
            </NSButton>
          )
        ) : null}
      </DSCard>

      <div className="flex-1">
        {selectedId === "hero" ? (
          <DSCard title="Portada">
            <NSHeroFieldsEditor tenantId={tenantId} tenantSlug={tenantSlug} draft={heroDraft} setDraft={setHeroDraft} />
          </DSCard>
        ) : selectedId === "story" ? (
          <DSCard title="Historia de fábrica">
            <NSStoryFieldsEditor tenantId={tenantId} tenantSlug={tenantSlug} draft={storyDraft} setDraft={setStoryDraft} />
          </DSCard>
        ) : selectedId === "statement" ? (
          <DSCard title="Frase destacada">
            <NSStatementFieldsEditor tenantId={tenantId} tenantSlug={tenantSlug} draft={statementDraft} setDraft={setStatementDraft} />
          </DSCard>
        ) : selectedId && infoSections[selectedId] ? (
          <DSCard title={infoSections[selectedId].title}>
            <p className="text-sm text-muted-foreground">{infoSections[selectedId].description}</p>
            <NSButton href={infoSections[selectedId].href} variant="outline" size="sm" className="mt-4">
              {infoSections[selectedId].ctaLabel}
            </NSButton>
          </DSCard>
        ) : (
          <NSEmptyState
            title="Selecciona un elemento"
            description="Haz click en cualquier sección de la vista previa para editarla."
          />
        )}
      </div>
    </div>
  );
}
