import type { Metadata } from "next";
import Link from "next/link";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { NSLogo } from "@/components/brand/NSLogo";
import { NSAccederForm } from "@/components/registro/NSAccederForm";
import { NSReveal } from "@/components/ui/NSReveal";
import { getTenantBySlug } from "@/lib/repositories/tenant-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { buildAccentOverrideVars } from "@/lib/utils/brand";
import type { SiteSettings } from "@/lib/types/catalog";

export const metadata: Metadata = {
  title: "Acceder",
  robots: { index: false, follow: false },
};

interface TenantHint {
  slug: string;
  settings: SiteSettings;
}

/**
 * `?tenant=` is an optional presentational hint (set by middleware.ts and
 * every redirect back to this page from a tenant's own admin routes) —
 * never a security boundary, and never allowed to break this page. A
 * stale, mistyped, or malicious slug just falls back to the generic DS
 * Catalog framing below; accederAction itself resolves the account's
 * real role from ds_app_users after submit, same as before.
 */
async function resolveTenantHint(slug: string | undefined): Promise<TenantHint | null> {
  if (!slug) return null;
  try {
    const tenant = await getTenantBySlug(slug);
    if (!tenant) return null;
    const settings = await getSettings(tenant.id);
    return { slug: tenant.slug, settings };
  } catch {
    return null;
  }
}

export default async function AccederPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { tenant: tenantSlug } = await searchParams;
  const tenantHint = await resolveTenantHint(tenantSlug);

  return (
    <div className="ds-platform flex min-h-dvh bg-background text-foreground">
      {/* Brand-story panel — DS Catalog's own identity, not any tenant's; hidden on mobile per the simplified-mobile brief. */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-surface p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%)" }}
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <DSPlatformMark className="h-9 w-9" />
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">DS Catalog</span>
        </div>
        <div className="relative max-w-md">
          <p className="font-display text-4xl uppercase leading-[0.95] tracking-wide text-foreground">
            La plataforma para catálogos digitales que venden
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Un panel, un catálogo, un pedido por WhatsApp — sin fricción entre tu marca y tu cliente.
          </p>
        </div>
        <p className="relative text-xs text-muted-foreground/60">© {new Date().getFullYear()} DS Catalog</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <NSReveal className="w-full max-w-sm" y={12}>
          <div className="mb-8 flex justify-center lg:hidden">
            <DSPlatformMark className="h-12 w-12" />
          </div>

          {tenantHint ? (
            <div
              className="tenant-preview mb-6 flex items-center gap-3 rounded-control border border-border bg-surface-elevated p-3"
              style={buildAccentOverrideVars(tenantHint.settings)}
            >
              <NSLogo
                id="acceder-tenant-hint"
                variant="mark"
                className="h-9 w-9 shrink-0"
                src={tenantHint.settings.brandLogo}
                brandName={tenantHint.settings.brandName}
                tagline={tenantHint.settings.heroSubtitle}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Entrando a</p>
                <p className="truncate text-sm font-semibold text-foreground">{tenantHint.settings.brandName}</p>
              </div>
            </div>
          ) : null}

          <div className="mb-6 text-center lg:text-left">
            <p className="font-display text-2xl uppercase tracking-wide">Acceder</p>
            <p className="mt-1 text-sm text-muted-foreground">Entra con tu correo y tu contraseña.</p>
          </div>

          <div className="rounded-card border border-border bg-surface-elevated p-6">
            <NSAccederForm />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿No tienes catálogo?{" "}
            <Link href="/registro" className="font-semibold text-accent-strong hover:underline">
              Crea el tuyo
            </Link>
          </p>
        </NSReveal>
      </div>
    </div>
  );
}
