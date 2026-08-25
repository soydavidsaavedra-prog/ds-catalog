import { NSButton } from "@/components/ui/NSButton";

export function NSNotFound({ tenantSlug }: { tenantSlug?: string } = {}) {
  const base = tenantSlug ? `/${tenantSlug}` : "/";
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="font-display text-8xl text-accent-strong sm:text-9xl">404</p>
      <h1 className="font-display text-2xl uppercase tracking-wide sm:text-3xl">
        Esta página no existe
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        El enlace que seguiste puede estar roto o el producto ya no está disponible. Vuelve al
        catálogo para seguir explorando.
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <NSButton href={base}>Volver al inicio</NSButton>
        {tenantSlug ? (
          <NSButton href={`${base}/catalogo`} variant="outline">Ver catálogo</NSButton>
        ) : null}
      </div>
    </div>
  );
}
