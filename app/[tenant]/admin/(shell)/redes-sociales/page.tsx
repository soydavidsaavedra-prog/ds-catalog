import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listSocialAccounts } from "@/lib/repositories/social-accounts-repository";
import { listSocialPosts } from "@/lib/repositories/social-posts-repository";
import { listRecentSocialEvents } from "@/lib/repositories/social-auto-reply-repository";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { NSButton } from "@/components/ui/NSButton";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/types/social";

export const metadata: Metadata = { title: "Redes sociales" };

export default async function SocialHubPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [accounts, posts, events] = await Promise.all([
    listSocialAccounts(tenant.id),
    listSocialPosts(tenant.id),
    listRecentSocialEvents(tenant.id, 5),
  ]);
  const upcoming = posts.filter((p) => p.status === "scheduled").slice(0, 5);

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <DSPageHeader
        title="Redes sociales"
        description="Programa publicaciones, activa respuestas automáticas y revisa analíticas de tus cuentas de Facebook, Instagram y TikTok."
        actions={<NSButton href={`/${tenantSlug}/admin/redes-sociales/cuentas`} size="sm">Cuentas</NSButton>}
      />

      {accounts.length === 0 ? (
        <DSCard title="Empieza por conectar una cuenta">
          <p className="text-sm text-muted-foreground">
            Conecta al menos una página de Facebook, cuenta de Instagram o perfil de TikTok para empezar a programar
            publicaciones y respuestas automáticas.
          </p>
          <NSButton href={`/${tenantSlug}/admin/redes-sociales/cuentas`} size="sm" className="mt-4">
            Conectar cuenta
          </NSButton>
        </DSCard>
      ) : (
        <DSCard title="Cuentas conectadas">
          <ul className="flex flex-wrap gap-2">
            {accounts.map((account) => (
              <li key={account.id} className="rounded-pill border border-border px-3 py-1 text-xs text-foreground">
                {account.displayName} · {SOCIAL_PLATFORM_LABELS[account.platform]}
              </li>
            ))}
          </ul>
        </DSCard>
      )}

      <DSCard
        title="Próximas publicaciones"
        description={upcoming.length === 0 ? "No hay publicaciones programadas." : undefined}
        actions={<NSButton href={`/${tenantSlug}/admin/redes-sociales/publicaciones`} variant="ghost" size="sm">Ver todas</NSButton>}
      >
        {upcoming.length > 0 ? (
          <ul className="divide-y divide-border">
            {upcoming.map((post) => (
              <li key={post.id} className="py-2 text-sm text-foreground">
                <span className="text-muted-foreground">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("es") : ""}</span>{" "}
                — {post.content || "(sin texto)"}
              </li>
            ))}
          </ul>
        ) : null}
      </DSCard>

      <DSCard
        title="Actividad reciente"
        description={events.length === 0 ? "Todavía no llegaron comentarios ni mensajes." : undefined}
        actions={<NSButton href={`/${tenantSlug}/admin/redes-sociales/respuestas`} variant="ghost" size="sm">Ver bandeja</NSButton>}
      >
        {events.length > 0 ? (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li key={event.id} className="py-2 text-sm text-foreground">
                {SOCIAL_PLATFORM_LABELS[event.platform]} · {event.messageText}
              </li>
            ))}
          </ul>
        ) : null}
      </DSCard>
    </div>
  );
}
