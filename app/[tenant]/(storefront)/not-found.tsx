import { NSNotFound } from "@/components/ui/NSNotFound";

/**
 * Next.js doesn't always pass `params` to a not-found.tsx boundary — when
 * a nested page (e.g. /producto/[slug]) calls notFound() during static
 * generation, the nearest not-found.tsx is rendered with `params`
 * undefined, not a Promise. Treating it as optional here (and falling
 * back to the untenanted NSNotFound, which already supports that) avoids
 * crashing the whole build the way destructuring an undefined value did.
 */
export default async function StorefrontNotFound({
  params,
}: {
  params?: Promise<{ tenant: string }>;
}) {
  const resolved = params ? await params : undefined;
  return <NSNotFound tenantSlug={resolved?.tenant} />;
}
