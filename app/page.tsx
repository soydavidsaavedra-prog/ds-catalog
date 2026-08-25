import type { Metadata } from "next";
import Link from "next/link";
import { listActiveTenants } from "@/lib/tenant/resolve-tenant";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";

export const metadata: Metadata = {
  title: "DS Catalog",
  description: "DS Catalog aloja catálogos y tiendas conversacionales independientes bajo un solo motor.",
};

/**
 * Root landing — deliberately minimal. It stopped being El Nuevo
 * Sánchez's homepage the moment the storefront moved to
 * /[tenant]/(storefront)/page.tsx; this page just orients a visitor who
 * lands on the bare domain toward an actual tenant. It intentionally does
 * not try to be a full SaaS marketing site yet.
 */
export default async function RootLandingPage() {
  const tenants = await listActiveTenants();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-4">
        <DSPlatformMark className="h-20 w-20" />
        <div>
          <p className="font-display text-4xl uppercase tracking-wide">DS Catalog</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Catálogos y tiendas conversacionales, cada una en su propio enlace.
          </p>
        </div>
      </div>

      {tenants.length > 0 ? (
        <div className="flex flex-col gap-3">
          {tenants.map((tenant) => (
            <Link
              key={tenant.slug}
              href={`/${tenant.slug}`}
              className="rounded-control border border-border-strong px-6 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-accent-strong hover:text-accent-strong"
            >
              {tenant.name}
            </Link>
          ))}
        </div>
      ) : null}

      <Link
        href="/registro"
        className="rounded-control bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-strong"
      >
        Crear mi catálogo
      </Link>
    </div>
  );
}
