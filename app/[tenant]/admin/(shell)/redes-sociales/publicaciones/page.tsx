import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listSocialAccounts } from "@/lib/repositories/social-accounts-repository";
import { listSocialPosts } from "@/lib/repositories/social-posts-repository";
import { deleteSocialPostAction } from "@/app/[tenant]/admin/(shell)/redes-sociales/actions";
import { NSSocialComposer } from "@/components/admin/social/NSSocialComposer";
import { DSPageHeader } from "@/components/ui/DSPageHeader";
import { DSCard } from "@/components/ui/DSCard";
import { NSButton } from "@/components/ui/NSButton";
import { SOCIAL_PLATFORM_LABELS, type SocialPostStatus } from "@/lib/types/social";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Publicaciones" };

const STATUS_LABELS: Record<SocialPostStatus, string> = {
  draft: "Borrador",
  scheduled: "Programada",
  publishing: "Publicando…",
  published: "Publicada",
  failed: "Falló",
};

const STATUS_CLASSES: Record<SocialPostStatus, string> = {
  draft: "text-muted-foreground",
  scheduled: "text-accent-strong",
  publishing: "text-accent-strong",
  published: "text-success",
  failed: "text-danger",
};

export default async function SocialPostsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await resolveTenant(tenantSlug);
  const [accounts, posts] = await Promise.all([listSocialAccounts(tenant.id), listSocialPosts(tenant.id)]);
  const accountsById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <DSPageHeader
        title="Publicaciones"
        description="Programa publicaciones para tus cuentas conectadas — un proceso automático las publica en cuanto llega la fecha (revisa cada pocos minutos)."
      />

      <DSCard title="Nueva publicación">
        <NSSocialComposer tenantId={tenant.id} tenantSlug={tenantSlug} accounts={accounts} />
      </DSCard>

      <DSCard title="Historial" description={posts.length === 0 ? "Todavía no hay publicaciones." : undefined}>
        {posts.length > 0 ? (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {accountsById.get(post.accountId)?.displayName ?? "Cuenta eliminada"} · {SOCIAL_PLATFORM_LABELS[post.platform]}
                  </p>
                  <p className="mt-1 truncate text-sm text-foreground">{post.content || "(sin texto)"}</p>
                  <p className={cn("mt-1 text-xs font-semibold uppercase tracking-wide", STATUS_CLASSES[post.status])}>
                    {STATUS_LABELS[post.status]}
                    {post.scheduledAt ? ` · ${new Date(post.scheduledAt).toLocaleString("es")}` : ""}
                  </p>
                  {post.errorMessage ? <p className="mt-1 text-xs text-danger">{post.errorMessage}</p> : null}
                </div>
                {post.status === "draft" || post.status === "scheduled" || post.status === "failed" ? (
                  <form action={deleteSocialPostAction.bind(null, tenant.id, tenantSlug, post.id)}>
                    <NSButton type="submit" variant="ghost" size="sm">
                      Eliminar
                    </NSButton>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </DSCard>
    </div>
  );
}
