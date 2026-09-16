import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listSocialAccounts } from "@/lib/repositories/social-accounts-repository";
import { isMetaConfigured } from "@/lib/social/meta";
import { isTikTokConfigured } from "@/lib/social/tiktok";
import { disconnectSocialAccountAction } from "@/app/[tenant]/admin/(shell)/redes-sociales/actions";
import { NSConnectWhatsAppForm } from "@/components/admin/social/NSConnectWhatsAppForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { NSButton } from "@/components/ui/NSButton";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/types/social";

export const metadata: Metadata = { title: "Cuentas de redes sociales" };

const ERROR_MESSAGES: Record<string, string> = {
  meta_not_configured: "Meta no está configurado en esta plataforma (faltan META_APP_ID/META_APP_SECRET).",
  tiktok_not_configured: "TikTok no está configurado en esta plataforma (faltan TIKTOK_CLIENT_KEY/TIKTOK_CLIENT_SECRET).",
  no_pages_found: "Tu cuenta de Meta no administra ninguna Página de Facebook — crea una Página primero.",
};

export default async function SocialAccountsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const { connected, error } = await searchParams;
  const tenant = await resolveTenant(tenantSlug);
  const accounts = await listSocialAccounts(tenant.id);

  const metaConfigured = isMetaConfigured();
  const tiktokConfigured = isTikTokConfigured();
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? decodeURIComponent(error)) : null;

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <DSPageHeader
        title="Cuentas de redes sociales"
        description="Conecta tus páginas de Facebook, cuentas de Instagram y perfil de TikTok para programar publicaciones, respuestas automáticas y analíticas."
      />

      {connected ? (
        <p className="rounded-control border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Cuenta conectada correctamente.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-control border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{errorMessage}</p>
      ) : null}

      <DSCard title="Conectar una cuenta nueva">
        <div className="flex flex-wrap gap-3">
          <NSButton href={`/${tenantSlug}/admin/api/social/oauth/meta/start`} variant="outline">
            Conectar Facebook / Instagram
          </NSButton>
          <NSButton href={`/${tenantSlug}/admin/api/social/oauth/tiktok/start`} variant="outline">
            Conectar TikTok
          </NSButton>
        </div>
        {!metaConfigured ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Meta todavía no está configurado en esta plataforma — un operador debe definir META_APP_ID/META_APP_SECRET.
          </p>
        ) : null}
        {!tiktokConfigured ? (
          <p className="mt-1 text-xs text-muted-foreground">
            TikTok todavía no está configurado en esta plataforma — un operador debe definir TIKTOK_CLIENT_KEY/TIKTOK_CLIENT_SECRET.
          </p>
        ) : null}
      </DSCard>

      <DSCard
        title="Conectar un número de WhatsApp"
        description="A diferencia de Facebook/Instagram/TikTok, WhatsApp no usa este botón de OAuth — se conecta pegando credenciales que obtienes del panel de Meta (Casos de uso → Conectarte con los clientes a través de WhatsApp → Configuración de la API)."
      >
        <NSConnectWhatsAppForm tenantId={tenant.id} tenantSlug={tenantSlug} />
      </DSCard>

      <DSCard title="Tus cuentas conectadas" description={accounts.length === 0 ? "Todavía no conectaste ninguna cuenta." : undefined}>
        {accounts.length > 0 ? (
          <ul className="divide-y divide-border">
            {accounts.map((account) => (
              <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{account.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {SOCIAL_PLATFORM_LABELS[account.platform]} ·{" "}
                    <span className={account.status === "active" ? "text-success" : "text-danger"}>
                      {account.status === "active" ? "Activa" : account.status === "expired" ? "Token vencido — reconecta" : "Revocada"}
                    </span>
                  </p>
                </div>
                <form action={disconnectSocialAccountAction.bind(null, tenant.id, tenantSlug, account.id)}>
                  <NSButton type="submit" variant="ghost" size="sm">
                    Desconectar
                  </NSButton>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </DSCard>
    </div>
  );
}
