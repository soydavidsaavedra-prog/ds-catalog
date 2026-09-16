import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listSocialAccounts } from "@/lib/repositories/social-accounts-repository";
import { listAutoReplyRules, listRecentSocialEvents } from "@/lib/repositories/social-auto-reply-repository";
import {
  deleteAutoReplyRuleAction,
  toggleAutoReplyRuleAction,
} from "@/app/[tenant]/admin/(shell)/redes-sociales/actions";
import { NSAutoReplyRuleForm } from "@/components/admin/social/NSAutoReplyRuleForm";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { NSButton } from "@/components/ui/NSButton";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/types/social";

export const metadata: Metadata = { title: "Respuestas automáticas" };

export default async function SocialAutoReplyPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [accounts, rules, events] = await Promise.all([
    listSocialAccounts(tenant.id),
    listAutoReplyRules(tenant.id),
    listRecentSocialEvents(tenant.id),
  ]);
  const accountsById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <DSPageHeader
        title="Respuestas automáticas"
        description="Reglas por palabra clave que responden solas a comentarios y mensajes directos. Disponible hoy para Facebook e Instagram — TikTok no expone una API pública de comentarios/DMs."
      />

      <DSCard title="Nueva regla">
        <NSAutoReplyRuleForm tenantId={tenant.id} tenantSlug={tenantSlug} accounts={accounts} />
      </DSCard>

      <DSCard title="Tus reglas" description={rules.length === 0 ? "Todavía no hay reglas configuradas." : undefined}>
        {rules.length > 0 ? (
          <ul className="divide-y divide-border">
            {rules.map((rule) => (
              <li key={rule.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {accountsById.get(rule.accountId)?.displayName ?? "Cuenta eliminada"} ·{" "}
                    {rule.triggerType === "comment" ? "Comentarios" : "Mensajes directos"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rule.keywords.length > 0 ? `Palabras clave: ${rule.keywords.join(", ")}` : "Responde a todo"} — &ldquo;{rule.replyTemplate}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleAutoReplyRuleAction.bind(null, tenant.id, tenantSlug, rule.id, !rule.active)}>
                    <NSButton type="submit" variant="outline" size="sm">
                      {rule.active ? "Pausar" : "Activar"}
                    </NSButton>
                  </form>
                  <form action={deleteAutoReplyRuleAction.bind(null, tenant.id, tenantSlug, rule.id)}>
                    <NSButton type="submit" variant="ghost" size="sm">
                      Eliminar
                    </NSButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </DSCard>

      <DSCard title="Bandeja de entrada" description={events.length === 0 ? "Todavía no llegaron comentarios ni mensajes." : "Últimos comentarios/DMs recibidos, con la respuesta automática que activaron (si alguna)."}>
        {events.length > 0 ? (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li key={event.id} className="py-3">
                <p className="text-xs text-muted-foreground">
                  {SOCIAL_PLATFORM_LABELS[event.platform]} · {event.eventType === "comment" ? "Comentario" : "DM"} · {new Date(event.createdAt).toLocaleString("es")}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {event.senderName ? <span className="font-medium">{event.senderName}: </span> : null}
                  {event.messageText}
                </p>
                {event.replied ? (
                  <p className="mt-1 text-xs text-success">Respondido automáticamente: &ldquo;{event.replyText}&rdquo;</p>
                ) : event.replyError ? (
                  <p className="mt-1 text-xs text-danger">Falló la respuesta automática: {event.replyError}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Ninguna regla coincidió.</p>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </DSCard>
    </div>
  );
}
