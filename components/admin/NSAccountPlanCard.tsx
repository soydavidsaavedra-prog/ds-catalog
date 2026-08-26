"use client";

import { useActionState, useState } from "react";
import {
  requestPlanChangeAction,
  cancelPlanChangeRequestAction,
  type AccountActionState,
} from "@/app/[tenant]/admin/cuenta/actions";
import type { Subscription } from "@/lib/repositories/subscriptions-repository";
import type { Plan } from "@/lib/repositories/plans-repository";
import { NSButton } from "@/components/ui/NSButton";
import { NSPrice } from "@/components/ui/NSPrice";
import { cn } from "@/lib/utils/cn";

const initialState: AccountActionState = {};

export function NSAccountPlanCard({
  tenantId,
  tenantSlug,
  subscription,
  plans,
}: {
  tenantId: string;
  tenantSlug: string;
  subscription: Subscription | null;
  plans: Plan[];
}) {
  const currentPlan = subscription ? plans.find((p) => p.id === subscription.planId) : null;
  const requestedPlan = subscription?.requestedPlanId ? plans.find((p) => p.id === subscription.requestedPlanId) : null;

  return (
    <section>
      <h2 className="font-display text-lg uppercase tracking-wide">Tu plan</h2>

      {!subscription ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Todavía no tienes un plan asignado — contáctanos para elegir uno.
        </p>
      ) : (
        <>
          <div className="mt-3 rounded-card border border-border bg-surface-elevated p-5">
            <p className="font-display text-xl">{currentPlan?.name ?? "Plan eliminado"}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Estado: {subscription.status}
              {subscription.expiresAt ? ` · vence ${new Date(subscription.expiresAt).toLocaleDateString("es")}` : ""}
            </p>
          </div>

          {requestedPlan ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
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
    </section>
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
