import "server-only";

/**
 * Thin wrapper over Vercel's Domains REST API — adding a domain to this
 * project is what actually makes Vercel's edge network route traffic for
 * it here; without this step, a correct DNS record alone does nothing
 * (Vercel only serves domains it knows about). See
 * https://vercel.com/docs/rest-api/reference/endpoints/domains.
 *
 * Deliberately optional, same pattern as this project's Sentry wiring
 * (NEXT_PUBLIC_SENTRY_DSN): without VERCEL_API_TOKEN/VERCEL_PROJECT_ID set,
 * every function here returns a `configured: false` result instead of
 * throwing, so self-hosting or a from-source deploy without a Vercel
 * account still works — the tenant just gets manual DNS instructions and
 * relies on the platform operator to add the domain by hand in the Vercel
 * dashboard instead of this API doing it automatically.
 */

const API_BASE = "https://api.vercel.com";

function credentials(): { token: string; projectId: string; teamId: string | null } | null {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;
  return { token, projectId, teamId: process.env.VERCEL_TEAM_ID ?? null };
}

function withTeamQuery(path: string, teamId: string | null): string {
  if (!teamId) return path;
  return `${path}${path.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(teamId)}`;
}

export interface VercelDomainVerificationChallenge {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

export type AddDomainResult =
  | { configured: false }
  | { configured: true; ok: true; verified: boolean; verification: VercelDomainVerificationChallenge[] }
  | { configured: true; ok: false; error: string };

/** Registers `domain` on this Vercel project. Idempotent — re-adding a domain this project already owns succeeds instead of erroring. */
export async function addDomainToVercelProject(domain: string): Promise<AddDomainResult> {
  const creds = credentials();
  if (!creds) return { configured: false };

  const res = await fetch(
    withTeamQuery(`${API_BASE}/v10/projects/${creds.projectId}/domains`, creds.teamId),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${creds.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: domain }),
    },
  );

  const body = await res.json().catch(() => ({}));

  if (res.status === 409 && body?.error?.code === "domain_already_in_use") {
    // Already registered on this same project (e.g. a retried "guardar") — treat as success.
    const config = await getDomainConfig(domain);
    return config.configured
      ? { configured: true, ok: true, verified: config.ok ? config.verified : false, verification: [] }
      : { configured: false };
  }

  if (!res.ok) {
    return { configured: true, ok: false, error: body?.error?.message ?? `Vercel respondió ${res.status}.` };
  }

  return {
    configured: true,
    ok: true,
    verified: body.verified === true,
    verification: Array.isArray(body.verification) ? body.verification : [],
  };
}

export async function removeDomainFromVercelProject(domain: string): Promise<void> {
  const creds = credentials();
  if (!creds) return;

  await fetch(
    withTeamQuery(`${API_BASE}/v9/projects/${creds.projectId}/domains/${encodeURIComponent(domain)}`, creds.teamId),
    { method: "DELETE", headers: { Authorization: `Bearer ${creds.token}` } },
  );
  // A 404 here just means it was already gone — nothing to roll back to, so this never throws.
}

export type DomainConfigResult =
  | { configured: false }
  | { configured: true; ok: true; verified: boolean; misconfigured: boolean }
  | { configured: true; ok: false; error: string };

/** Checks whether `domain`'s DNS actually points at Vercel yet — poll this from a "Verificar" button rather than assuming addDomainToVercelProject's initial response is final (DNS propagation takes time). */
export async function getDomainConfig(domain: string): Promise<DomainConfigResult> {
  const creds = credentials();
  if (!creds) return { configured: false };

  const [domainRes, configRes] = await Promise.all([
    fetch(withTeamQuery(`${API_BASE}/v9/projects/${creds.projectId}/domains/${encodeURIComponent(domain)}`, creds.teamId), {
      headers: { Authorization: `Bearer ${creds.token}` },
    }),
    fetch(withTeamQuery(`${API_BASE}/v6/domains/${encodeURIComponent(domain)}/config`, creds.teamId), {
      headers: { Authorization: `Bearer ${creds.token}` },
    }),
  ]);

  if (!domainRes.ok) {
    const body = await domainRes.json().catch(() => ({}));
    return { configured: true, ok: false, error: body?.error?.message ?? `Vercel respondió ${domainRes.status}.` };
  }

  const domainBody = await domainRes.json().catch(() => ({}));
  const configBody = await configRes.json().catch(() => ({}));

  return {
    configured: true,
    ok: true,
    verified: domainBody.verified === true,
    misconfigured: configBody?.misconfigured === true,
  };
}
