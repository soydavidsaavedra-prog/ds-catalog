/**
 * Looks up a tenant slug by custom domain, for middleware.ts's rewrite —
 * deliberately NOT importing "server-only" or @supabase/supabase-js (unlike
 * every other repository in lib/repositories/*), the same split
 * lib/auth/admin-token.ts and lib/auth/superadmin-token.ts already use:
 * middleware.ts runs in the Edge runtime, so this stays a plain fetch call
 * against Supabase's PostgREST endpoint instead of pulling in the full SDK.
 *
 * Queries with the service_role key (not the anon key) because ds_tenants
 * has row level security enabled with no anon/authenticated select policy
 * (see supabase/schema.sql) — every other read in this app goes through
 * the service-role Supabase client for the same reason. This is still a
 * server-only code path (middleware.ts is never bundled to the browser),
 * so that's the same trust boundary the rest of the app already relies on.
 *
 * Only ever returns a VERIFIED, ACTIVE tenant's slug — same "safe by
 * default" filter as lib/repositories/tenant-repository.ts's
 * getTenantByCustomDomain, kept as a separate query here purely for the
 * Edge-runtime constraint above.
 */
export async function resolveTenantSlugByCustomDomain(host: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  const endpoint =
    `${url}/rest/v1/ds_tenants?select=slug&custom_domain=eq.${encodeURIComponent(host)}` +
    `&custom_domain_verified=eq.true&status=eq.active&limit=1`;

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      // Best-effort: Next.js's fetch cache extensions apply in middleware too,
      // so a custom domain's mapping is refetched at most once a minute
      // instead of on every single request. Falls back to an uncached
      // fetch if the runtime doesn't honor this — still correct, just slower.
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { slug: string }[];
    return rows[0]?.slug ?? null;
  } catch {
    // Fail open to "not a mapped custom domain" — same reasoning as
    // lib/auth/login-rate-limit.ts's fail-open design: a Supabase hiccup
    // here should never turn into a platform-wide outage for every custom
    // domain, it should just fall through to a 404 for that one request.
    return null;
  }
}
