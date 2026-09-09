/**
 * Normalizes and validates a tenant-submitted custom domain — shared by
 * the Server Action that sets one (app/[tenant]/admin/(shell)/dominio/
 * actions.ts) and its Vitest coverage. Pure/no I/O so both can exercise it
 * without a database or network call; uniqueness (is this domain already
 * taken by another tenant?) is a separate, DB-backed check in
 * lib/repositories/tenant-repository.ts's isCustomDomainTaken.
 */

const HOSTNAME_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/;

export interface DomainValidationResult {
  domain: string | null;
  error: string | null;
}

/** Lowercases, strips a protocol/credentials/port/path/query/hash and any trailing dot. Never throws — an unparsable input just falls through to the hostname regex, which rejects it. */
export function normalizeDomain(input: string): string {
  let value = input.trim().toLowerCase();
  value = value.replace(/^[a-z]+:\/\//, "");
  value = value.replace(/^[^@/]+@/, "");
  value = value.split(/[/?#]/)[0] ?? "";
  value = value.replace(/:\d+$/, "");
  value = value.replace(/\.$/, "");
  return value;
}

/**
 * `platformHost` is this deployment's own domain (e.g. "ds-catalog.vercel.app"
 * from NEXT_PUBLIC_SITE_URL, see lib/config/site.ts) — a tenant can never
 * "add" the platform's own domain, or any *.vercel.app preview host, as
 * their custom domain.
 */
export function validateDomain(input: string, platformHost: string): DomainValidationResult {
  const domain = normalizeDomain(input);

  if (!domain) {
    return { domain: null, error: "Ingresa un dominio." };
  }
  if (domain === "localhost" || domain.endsWith(".localhost")) {
    return { domain: null, error: "Ese dominio no es válido." };
  }
  if (IPV4_PATTERN.test(domain) || domain.includes(":")) {
    return { domain: null, error: "Ingresa un dominio, no una dirección IP." };
  }
  if (!HOSTNAME_PATTERN.test(domain)) {
    return { domain: null, error: "Ese dominio no tiene un formato válido (ej: tutienda.com)." };
  }
  if (domain === platformHost.toLowerCase() || domain.endsWith(".vercel.app")) {
    return { domain: null, error: "Ese dominio pertenece a la plataforma y no puede usarse como dominio propio." };
  }

  return { domain, error: null };
}

/**
 * True when `host` (a raw request Host header, already lowercased/without
 * port) is the platform itself rather than a tenant's custom domain — used
 * by middleware.ts to decide whether a request needs the custom-domain
 * rewrite at all. Deliberately treats every *.vercel.app host as the
 * platform: preview deployments get a different vercel.app subdomain per
 * branch, none of which are ever a tenant's own domain.
 */
export function isPlatformHost(host: string, platformHost: string): boolean {
  const normalized = host.toLowerCase();
  if (normalized === "localhost" || normalized.endsWith(".localhost")) return true;
  if (normalized.endsWith(".vercel.app")) return true;
  return normalized === platformHost.toLowerCase();
}
