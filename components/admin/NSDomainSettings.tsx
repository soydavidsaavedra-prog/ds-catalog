"use client";

import { useActionState, useState } from "react";
import { setDomainAction, verifyDomainAction, removeDomainAction, type DomainActionState } from "@/app/[tenant]/admin/(shell)/dominio/actions";
import { NSInput, NSLabel } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { DSStatusBadge } from "@/components/ui/DSStatusBadge";

const initialState: DomainActionState = {};

export function NSDomainSettings({
  tenantId,
  tenantSlug,
  currentDomain,
  verified,
}: {
  tenantId: string;
  tenantSlug: string;
  currentDomain: string | null;
  verified: boolean;
}) {
  if (!currentDomain) {
    return <NSDomainAddForm tenantId={tenantId} tenantSlug={tenantSlug} />;
  }
  return <NSDomainStatus tenantId={tenantId} tenantSlug={tenantSlug} domain={currentDomain} verified={verified} />;
}

function NSDomainAddForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const boundAction = setDomainAction.bind(null, tenantId, tenantSlug);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="rounded-card border border-border p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Conectar un dominio</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Escribe el dominio que ya compraste (ej. tutienda.com). Luego te mostraremos qué registro DNS agregar.
      </p>
      <form action={formAction} className="mt-4 flex max-w-md flex-col gap-4">
        {state.error ? (
          <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</div>
        ) : null}
        <div>
          <NSLabel htmlFor="domain">Dominio</NSLabel>
          <NSInput id="domain" name="domain" type="text" placeholder="tutienda.com" required autoComplete="off" />
        </div>
        <NSButton type="submit" loading={pending} size="sm" className="self-start">
          Conectar dominio
        </NSButton>
      </form>

      {state.success && state.verification && state.verification.length > 0 ? (
        <DnsInstructions verification={state.verification} />
      ) : null}
      {state.success && state.vercelConfigured === false ? (
        <p className="mt-4 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          Dominio guardado. La verificación automática no está configurada en esta plataforma — contacta al
          operador de DS Catalog para que termine de activarlo.
        </p>
      ) : null}
    </div>
  );
}

function NSDomainStatus({
  tenantId,
  tenantSlug,
  domain,
  verified,
}: {
  tenantId: string;
  tenantSlug: string;
  domain: string;
  verified: boolean;
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const verifyBoundAction = verifyDomainAction.bind(null, tenantId, tenantSlug);
  const [verifyState, verifyFormAction, verifying] = useActionState(verifyBoundAction, initialState);

  return (
    <div className="rounded-card border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Tu dominio</h3>
          <p className="mt-1 font-mono text-sm">{domain}</p>
        </div>
        <DSStatusBadge label={verified ? "Verificado" : "Pendiente"} tone={verified ? "success" : "warning"} />
      </div>

      {!verified ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Agrega este registro en el proveedor donde compraste el dominio (Namecheap, GoDaddy, Cloudflare, etc.)
            y luego presiona &quot;Verificar&quot;. El DNS puede tardar unos minutos en propagarse.
          </p>
          <div className="mt-3 overflow-x-auto rounded-control border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide">Tipo</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide">Nombre</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">A</td>
                  <td className="px-3 py-2 font-mono">@</td>
                  <td className="px-3 py-2 font-mono">76.76.21.21</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">CNAME</td>
                  <td className="px-3 py-2 font-mono">www</td>
                  <td className="px-3 py-2 font-mono">cname.vercel-dns.com</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Usa el registro A si conectaste el dominio raíz (tutienda.com), o el CNAME si usas un subdominio
            (www.tutienda.com).
          </p>

          {verifyState.error ? (
            <div className="mt-4 rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
              {verifyState.error}
            </div>
          ) : null}
          {verifyState.success ? (
            <div className="mt-4 rounded-control border border-success bg-success/10 px-4 py-3 text-sm text-success">
              ¡Dominio verificado! Ya puedes compartirlo con tus clientes.
            </div>
          ) : null}

          <form action={verifyFormAction} className="mt-4">
            <NSButton type="submit" loading={verifying} size="sm">
              Verificar
            </NSButton>
          </form>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Tu catálogo ya es accesible en{" "}
          <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="text-accent-strong underline">
            {domain}
          </a>
          .
        </p>
      )}

      <div className="mt-6 border-t border-border pt-4">
        {confirmingRemove ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">¿Quitar este dominio? Tu catálogo seguirá disponible en /{tenantSlug}.</p>
            <form action={removeDomainAction.bind(null, tenantId, tenantSlug)}>
              <NSButton type="submit" variant="outline" size="sm">
                Sí, quitar
              </NSButton>
            </form>
            <NSButton type="button" variant="ghost" size="sm" onClick={() => setConfirmingRemove(false)}>
              Cancelar
            </NSButton>
          </div>
        ) : (
          <NSButton type="button" variant="outline" size="sm" onClick={() => setConfirmingRemove(true)}>
            Quitar dominio
          </NSButton>
        )}
      </div>
    </div>
  );
}

function DnsInstructions({ verification }: { verification: { type: string; domain: string; value: string }[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-control border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-elevated text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Tipo</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Nombre</th>
            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Valor</th>
          </tr>
        </thead>
        <tbody>
          {verification.map((v, i) => (
            <tr key={i} className="border-t border-border">
              <td className="px-3 py-2 font-mono">{v.type}</td>
              <td className="px-3 py-2 font-mono">{v.domain}</td>
              <td className="px-3 py-2 font-mono">{v.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
