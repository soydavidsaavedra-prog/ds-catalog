"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction, type ActionState } from "@/app/[tenant]/admin/actions";
import { NSInput, NSLabel, NSTextarea } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { cn } from "@/lib/utils/cn";

const initialState: ActionState = {};

const STEPS = [
  { key: "marca", label: "Tu marca" },
  { key: "contacto", label: "Contacto y WhatsApp" },
] as const;

/**
 * Single <form> for both steps — every field stays mounted, only its step
 * panel is hidden, so the whole wizard submits once at the end via one
 * Server Action call instead of a round trip per step. State does not
 * persist across a page reload (unlike Horizon's localStorage-resumable
 * wizard); for a two-step form that's an acceptable simplification, and
 * "Finalizar" is reachable again any time since /admin/onboarding stays
 * open until onboarding_completed is set.
 */
export function NSOnboardingWizard({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const boundAction = completeOnboardingAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-accent" : "bg-ink-800",
            )}
          />
        ))}
      </div>

      {state.error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <div className={cn("flex flex-col gap-5", step !== 0 && "hidden")}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-0">Tu marca</p>
          <p className="mt-1 text-xs text-ink-400">
            Puedes cambiar esto cuando quieras desde Configuración.
          </p>
        </div>
        <div>
          <NSLabel htmlFor="slogan">Eslogan (opcional)</NSLabel>
          <NSInput id="slogan" name="slogan" placeholder="Ej. Hecho con cariño, entregado a tiempo" />
        </div>
        <div>
          <NSLabel htmlFor="brandDescription">Descripción breve (opcional)</NSLabel>
          <NSTextarea
            id="brandDescription"
            name="brandDescription"
            placeholder="Cuéntale a tus clientes qué vendes y qué te hace diferente."
          />
        </div>
      </div>

      <div className={cn("flex flex-col gap-5", step !== 1 && "hidden")}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-0">Contacto y WhatsApp</p>
          <p className="mt-1 text-xs text-ink-400">
            El número de WhatsApp es el que recibirá los pedidos de tu catálogo.
          </p>
        </div>
        <div>
          <NSLabel htmlFor="whatsappNumber">Número de WhatsApp</NSLabel>
          <NSInput id="whatsappNumber" name="whatsappNumber" placeholder="584121234567" inputMode="numeric" />
        </div>
        <div>
          <NSLabel htmlFor="whatsappDisplay">WhatsApp (como se muestra)</NSLabel>
          <NSInput id="whatsappDisplay" name="whatsappDisplay" placeholder="+58 412 123 4567" />
        </div>
        <div>
          <NSLabel htmlFor="contactEmail">Correo de contacto (opcional)</NSLabel>
          <NSInput id="contactEmail" name="contactEmail" type="email" placeholder="ventas@tunegocio.com" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <NSButton type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Atrás
          </NSButton>
        ) : (
          <span />
        )}
        {isLastStep ? (
          <NSButton type="submit" loading={pending}>
            Finalizar
          </NSButton>
        ) : (
          <NSButton type="button" onClick={() => setStep((s) => s + 1)}>
            Siguiente
          </NSButton>
        )}
      </div>
    </form>
  );
}
