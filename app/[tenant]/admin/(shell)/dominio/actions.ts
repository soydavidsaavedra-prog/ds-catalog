"use server";

import { revalidatePath } from "next/cache";
import { validateDomain } from "@/lib/domains/validate-domain";
import { addDomainToVercelProject, removeDomainFromVercelProject, getDomainConfig } from "@/lib/domains/vercel-domains";
import {
  getTenantById,
  isCustomDomainTaken,
  setTenantCustomDomain,
  removeTenantCustomDomain,
  markCustomDomainVerified,
} from "@/lib/repositories/tenant-repository";
import { siteConfig } from "@/lib/config/site";
import type { VercelDomainVerificationChallenge } from "@/lib/domains/vercel-domains";

export type DomainActionState = {
  error?: string;
  success?: boolean;
  /** DNS records Vercel still needs to see before it'll consider the domain verified — shown as setup instructions. Absent once verified, or when Vercel isn't configured (manual setup only). */
  verification?: VercelDomainVerificationChallenge[];
  /** False when VERCEL_API_TOKEN/VERCEL_PROJECT_ID aren't set — the domain is still stored, but nothing here calls Vercel, so DNS instructions are generic and "Verificar" can't check anything automatically. */
  vercelConfigured?: boolean;
};

function platformHost(): string {
  try {
    return new URL(siteConfig.seo.domain).hostname;
  } catch {
    return "ds-catalog.vercel.app";
  }
}

/**
 * Sets (or replaces) the tenant's custom domain. Always stores it
 * unverified first — middleware.ts won't route traffic for it until
 * verifyDomainAction (or this same call, if Vercel already reports it
 * verified — e.g. the domain was already correctly pointed before being
 * added here) confirms it.
 */
export async function setDomainAction(
  tenantId: string,
  tenantSlug: string,
  _prev: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const raw = String(formData.get("domain") ?? "");
  const { domain, error } = validateDomain(raw, platformHost());
  if (error || !domain) {
    return { error: error ?? "Ese dominio no es válido." };
  }

  if (await isCustomDomainTaken(domain, tenantId)) {
    return { error: "Ese dominio ya está en uso por otra cuenta." };
  }

  const result = await addDomainToVercelProject(domain);

  if (result.configured && !result.ok) {
    return { error: result.error };
  }

  await setTenantCustomDomain(tenantId, domain);

  const verified = result.configured && result.ok ? result.verified : false;
  if (verified) {
    await markCustomDomainVerified(tenantId, true);
  }

  revalidatePath(`/${tenantSlug}/admin/dominio`);
  return {
    success: true,
    vercelConfigured: result.configured,
    verification: result.configured && result.ok ? result.verification : [],
  };
}

/** Re-checks the current domain against Vercel — call from a "Verificar" button once DNS has had time to propagate. */
export async function verifyDomainAction(
  tenantId: string,
  tenantSlug: string,
  // Unused — required only so this matches useActionState's (state, formData) call shape; there's no form field to read, "Verificar" re-checks whatever domain is already stored.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: DomainActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<DomainActionState> {
  const tenant = await getTenantById(tenantId);
  if (!tenant?.customDomain) {
    return { error: "No tienes un dominio configurado todavía." };
  }

  const config = await getDomainConfig(tenant.customDomain);

  if (!config.configured) {
    return { error: "La verificación automática no está disponible en esta plataforma. Contacta al soporte.", vercelConfigured: false };
  }
  if (!config.ok) {
    return { error: config.error, vercelConfigured: true };
  }

  await markCustomDomainVerified(tenantId, config.verified);
  revalidatePath(`/${tenantSlug}/admin/dominio`);

  if (!config.verified) {
    return {
      error: config.misconfigured
        ? "El DNS todavía no apunta correctamente a la plataforma. Revisa los registros e inténtalo de nuevo en unos minutos."
        : "Todavía no se pudo verificar — el DNS puede tardar en propagarse.",
      vercelConfigured: true,
    };
  }
  return { success: true, vercelConfigured: true };
}

export async function removeDomainAction(tenantId: string, tenantSlug: string): Promise<void> {
  const tenant = await getTenantById(tenantId);
  if (tenant?.customDomain) {
    await removeDomainFromVercelProject(tenant.customDomain);
  }
  await removeTenantCustomDomain(tenantId);
  revalidatePath(`/${tenantSlug}/admin/dominio`);
}
