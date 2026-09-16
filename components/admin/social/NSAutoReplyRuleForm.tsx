"use client";

import { useRef, useState } from "react";
import { createAutoReplyRuleAction } from "@/app/[tenant]/admin/(shell)/redes-sociales/actions";
import { NSLabel, NSInput, NSTextarea, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { SOCIAL_PLATFORM_LABELS, type SocialAccount } from "@/lib/types/social";

export function NSAutoReplyRuleForm({
  tenantId,
  tenantSlug,
  accounts,
}: {
  tenantId: string;
  tenantSlug: string;
  accounts: SocialAccount[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedId, setSelectedId] = useState(accounts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const selected = accounts.find((a) => a.id === selectedId);

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Conecta al menos una cuenta en <a className="underline" href={`/${tenantSlug}/admin/redes-sociales/cuentas`}>Cuentas</a> antes de crear reglas.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setError(null);
        const result = await createAutoReplyRuleAction(tenantId, tenantSlug, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="hidden" name="platform" value={selected?.platform ?? ""} />
      <div>
        <NSLabel htmlFor="rule-account">Cuenta</NSLabel>
        <NSSelect id="rule-account" name="accountId" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName} — {SOCIAL_PLATFORM_LABELS[account.platform]}
            </option>
          ))}
        </NSSelect>
      </div>
      <div>
        <NSLabel htmlFor="rule-trigger">Se activa con</NSLabel>
        <NSSelect id="rule-trigger" name="triggerType" defaultValue="comment" key={selected?.platform}>
          {selected?.platform !== "whatsapp" ? <option value="comment">Comentarios</option> : null}
          <option value="dm">Mensajes directos</option>
        </NSSelect>
      </div>
      <div className="sm:col-span-2">
        <NSLabel htmlFor="rule-keywords">Palabras clave (separadas por coma — vacío = responde a todo)</NSLabel>
        <NSInput id="rule-keywords" name="keywords" placeholder="precio, envío, talla" />
      </div>
      <div className="sm:col-span-2">
        <NSLabel htmlFor="rule-reply">Respuesta automática</NSLabel>
        <NSTextarea id="rule-reply" name="replyTemplate" required placeholder="¡Gracias por escribirnos! Te respondemos por WhatsApp en breve." />
      </div>
      {selected?.platform === "tiktok" ? (
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          TikTok no ofrece una API pública de comentarios/mensajes todavía — esta regla se guardará pero no se activará hasta que exista esa integración.
        </p>
      ) : null}
      {error ? <p className="sm:col-span-2 text-sm text-danger">{error}</p> : null}
      <div className="flex items-end sm:col-span-2">
        <NSButton type="submit" size="sm">
          Crear regla
        </NSButton>
      </div>
    </form>
  );
}
