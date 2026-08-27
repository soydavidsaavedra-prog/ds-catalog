"use client";

import { useActionState, useState } from "react";
import {
  requestPlanChangeAction,
  cancelPlanChangeRequestAction,
  type AccountActionState,
} from "@/app/[tenant]/admin/cuenta/actions";
import type { Subscription, SubscriptionStatus } from "@/lib/repositories/subscriptions-repository";
import type { Plan } from "@/lib/repositories/plans-repository";
import { NSButton } from "@/components/ui/NSButton";
import { NSPrice } from "@/components/ui/NSPrice";
import { DSCard } from "@/components/ui/DSCard";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";
import { cn } from "@/lib/utils/cn";

const initialState: AccountActionState = {};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: "Activo",
  trial: "Prueba",
  pending: "Pendiente de aprobación",
  paused: "Pausado",
  expired: "Vencido",
  cancelled: "Cancelado",
};
const STATUS_TONE: Record<SubscriptionStatus, "success" | "warning" | "danger" | "muted" | "accent"> = {
  active: "success",
  trial: "accent",
  pending: "warning",
  paused: "muted",
  expired: "danger",
  cancelled: "danger",
};

export function NSAccountPlanCard({
  tenantId,
  tenantSlug,
  subscription,
  plans,
  productsUsed,
}: {
  tenantId: string;
  tenantSlug: string;
  subscription: Subscription | null;
  plans: Plan[];
  /** Real count from listProducts — the only usage metric shown here. Deliberately no storage/MB/DB numbers: those are Super Admin's, not the tenant's, to see. */
  productsUsed: number;
}) {
  const currentPlan = subscription ? plans.find((p) => p.id === subscription.planId) : null;
  const requestedPlan = subscription?.requestedPlanId ? plans.find((p) => p.id === subscription.requestedPlanId) : null;
  const maxProducts = currentPlan?.maxProducts ?? null;
  const productsPercent = maxProducts ? Math.min(100, (productsUsed / maxProducts) * 100) : null;
  const productsRemaining = maxProducts ? Math.max(0, maxProducts - productsUsed) : null;

  return (
    <DSCard
      title="Plan y uso"
      description="Información comercial de tu plan — sin datos técnicos de infraestructura."
      actions={
        <NSButton href="/" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
          Ver planes y precios
        </NSButton>
      }
    >
      {!subscription ? (
        <p className="text-sm text-muted-foreground">
          Todavía no tienes un plan asignado — contáctanos para elegir uno.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-xl">{currentPlan?.name ?? "Plan eliminado"}</p>
              {subscription.expiresAt ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Renueva el {new Date(subscription.expiresAt).toLocaleDateString("es")}
                </p>
              ) : null}
            </div>
            <DSStatusBadge label={STATUS_LABEL[subscription.status]} tone={STATUS_TONE[subscription.status]} />
          </div>

          {maxProducts ? (
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wide">Productos</span>
                <span>
                  {productsUsed} / {maxProducts} · {Math.round(productsPercent ?? 0)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface">
                <div
                  className={`h-full rounded-pill ${productsPercent !== null && productsPercent >= 80 ? "bg-danger" : "bg-accent"}`}
                  style={{ width: `${Math.max(2, productsPercent ?? 0)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {productsRemaining === 0
                  ? "Alcanzaste el límite de productos de tu plan"
                  : `Queda espacio para ${productsRemaining} producto${productsRemaining === 1 ? "" : "s"}`}
              </p>
            </div>
          ) : null}

          {requestedPlan ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
              <span>Pediste cambiar a {requestedPlan.name} — en revisión.</span>
              <CancelRequestButton tenantId={tenantId} tenantSlug={tenantSlug} />
            </div>
          ) : (
            <ChangePlanForm
              tenantId={tenantId}
              tenantSlug={tenantSlug}
              plans={plans.filter((p) => p.active && p.id !== subscription.planId)}
            />
          )}
        </>
      )}
    </DSCard>
  );
}

function CancelRequestButton({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  return (
    <form action={cancelPlanChangeRequestAction.bind(null, tenantId, tenantSlug)}>
      <NSButton type="submit" variant="outline" size="sm">
        Cancelar solicitud
      </NSButton>
    </form>
  );
}

function ChangePlanForm({ tenantId, tenantSlug, plans }: { tenantId: string; tenantSlug: string; plans: Plan[] }) {
  const boundAction = requestPlanChangeAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [planId, setPlanId] = useState("");

  if (plans.length === 0) return null;

  if (state.success) {
    return <p className="mt-3 text-sm text-muted-foreground">Tu solicitud fue enviada — te avisamos cuando quede activa.</p>;
  }

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div>
      ) : null}
      <input type="hidden" name="planId" value={planId} />
      <p className="text-sm font-medium">¿Quieres cambiar de plan?</p>
      <div className="flex flex-col gap-2">
        {plans.map((plan) => (
          <label
            key={plan.id}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-2 rounded-control border px-4 py-2.5 text-sm transition-colors",
              planId === plan.id ? "border-accent bg-accent/10" : "border-border hover:border-border-strong",
            )}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="planId-radio"
                checked={planId === plan.id}
                onChange={() => setPlanId(plan.id)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="font-semibold">{plan.name}</span>
            </span>
            <NSPrice amount={plan.priceCents / 100} size="sm" />
          </label>
        ))}
      </div>
      <NSButton type="submit" loading={pending} disabled={!planId} className="self-start" size="sm">
        Solicitar cambio
      </NSButton>
    </form>
  );
}
