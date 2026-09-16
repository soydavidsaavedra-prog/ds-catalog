"use client";

import { useRef, useState } from "react";
import { createSocialPostAction } from "@/app/[tenant]/admin/(shell)/redes-sociales/actions";
import { NSLabel, NSInput, NSTextarea, NSSelect } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import { NSSingleImageUploader } from "@/components/admin/NSSingleImageUploader";
import { SOCIAL_PLATFORM_LABELS, type SocialAccount } from "@/lib/types/social";

/** Composes and schedules one social post. Media input switches shape by platform: Meta needs a hosted image URL (the uploader gives one), TikTok's Content Posting API needs a hosted video URL (no video uploader in this app yet, so it's a plain URL field). */
export function NSSocialComposer({
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
  const [mediaUrl, setMediaUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const selected = accounts.find((a) => a.id === selectedId);

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Conecta al menos una cuenta en <a className="underline" href={`/${tenantSlug}/admin/redes-sociales/cuentas`}>Cuentas</a> antes de programar publicaciones.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setError(null);
        const result = await createSocialPostAction(tenantId, tenantSlug, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        formRef.current?.reset();
        setMediaUrl("");
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="hidden" name="platform" value={selected?.platform ?? ""} />
      <div>
        <NSLabel htmlFor="post-account">Cuenta</NSLabel>
        <NSSelect id="post-account" name="accountId" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName} — {SOCIAL_PLATFORM_LABELS[account.platform]}
            </option>
          ))}
        </NSSelect>
      </div>
      <div>
        <NSLabel htmlFor="post-schedule">Programar para (vacío = guardar como borrador)</NSLabel>
        <NSInput id="post-schedule" name="scheduledAt" type="datetime-local" />
      </div>
      <div className="sm:col-span-2">
        <NSLabel htmlFor="post-content">Texto</NSLabel>
        <NSTextarea id="post-content" name="content" placeholder="Escribe el texto de la publicación..." />
      </div>
      <div className="sm:col-span-2">
        {selected?.platform === "tiktok" ? (
          <>
            <NSLabel htmlFor="post-video-url">URL pública del video (requerido por TikTok)</NSLabel>
            <NSInput
              id="post-video-url"
              name="mediaUrl"
              type="url"
              placeholder="https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </>
        ) : (
          <>
            <NSLabel>Imagen (opcional en Facebook, requerida en Instagram)</NSLabel>
            <input type="hidden" name="mediaUrl" value={mediaUrl} />
            <NSSingleImageUploader tenantSlug={tenantSlug} name="mediaUrlUploader" onChange={setMediaUrl} />
          </>
        )}
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-danger">{error}</p> : null}
      <div className="flex items-end sm:col-span-2">
        <NSButton type="submit" size="sm">
          Guardar publicación
        </NSButton>
      </div>
    </form>
  );
}
