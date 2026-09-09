import { THEME_META } from "@/lib/themes/registry";
import type { ThemeKey } from "@/lib/types/tenant";
import { updateTenantThemeAction } from "@/app/[tenant]/admin/actions";
import { DSCard } from "@/components/ui/DSCard";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";
import { NSButton } from "@/components/ui/NSButton";
import { cn } from "@/lib/utils/cn";

/**
 * Decorative-only preview swatches (background/surface/accent) for each
 * registered Theme's DEFAULT look — not the tenant's own accentColor
 * override, which still applies regardless of which Theme is active. Kept
 * here rather than derived from app/globals.css since these three colors
 * per Theme are just a visual hint for this picker, not something any
 * component actually renders with.
 */
const THEME_SWATCHES: Record<ThemeKey, { background: string; surface: string; accent: string }> = {
  "theme-01": { background: "#ffffff", surface: "#f7f7f6", accent: "#00a19a" },
  "theme-02": { background: "#0b0b0a", surface: "#141412", accent: "#f97316" },
};

/**
 * Lets a tenant pick which Theme renders their public storefront, limited
 * to whatever their plan allows (`allowedThemes` — null means every
 * registered Theme in lib/themes/registry.ts, same "unrestricted" meaning
 * as null on maxProducts/maxStorageMb/maxImages). A Theme outside that set
 * renders locked, with an upsell link to Mi cuenta's plan section instead
 * of a working button — updateTenantThemeAction enforces the same rule
 * server-side, so this is UX, not the real gate. Selecting a Theme never
 * touches products, categories, or settings — every Theme reads the same
 * real data, only presentation changes.
 */
export function NSThemeSelector({
  tenantId,
  tenantSlug,
  currentTheme,
  allowedThemes,
}: {
  tenantId: string;
  tenantSlug: string;
  currentTheme: ThemeKey;
  allowedThemes: ThemeKey[] | null;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Object.values(THEME_META).map((meta) => {
        const active = meta.key === currentTheme;
        const allowed = !allowedThemes || allowedThemes.includes(meta.key);
        const swatch = THEME_SWATCHES[meta.key];
        return (
          <DSCard
            key={meta.key}
            className={cn(
              active && "ring-2 ring-accent ring-offset-2 ring-offset-background",
              !allowed && "opacity-60",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-6 w-6 rounded-full border border-border" style={{ background: swatch.background }} />
                <span className="h-6 w-6 rounded-full border border-border" style={{ background: swatch.surface }} />
                <span className="h-6 w-6 rounded-full border border-border" style={{ background: swatch.accent }} />
              </div>
              {active ? (
                <DSStatusBadge label="Activo" tone="success" />
              ) : !allowed ? (
                <DSStatusBadge label="No incluido en tu plan" tone="muted" />
              ) : null}
            </div>
            <p className="mt-4 font-display text-lg">{meta.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
            {active ? (
              <p className="mt-5 text-xs font-medium text-muted-foreground">Este es tu tema actual.</p>
            ) : allowed ? (
              <form action={updateTenantThemeAction.bind(null, tenantId, tenantSlug, meta.key)} className="mt-5">
                <NSButton type="submit" variant="outline" size="sm">
                  Usar este tema
                </NSButton>
              </form>
            ) : (
              <NSButton href={`/${tenantSlug}/admin/cuenta#plan-uso`} variant="outline" size="sm" className="mt-5">
                Mejorar mi plan
              </NSButton>
            )}
          </DSCard>
        );
      })}
    </div>
  );
}
