"use client";

import { useState } from "react";
import { NSButton } from "@/components/ui/NSButton";

/**
 * Copy uses the real Clipboard API; Share only renders when the browser
 * actually exposes navigator.share (mobile browsers mostly, most desktop
 * browsers don't) — feature-detected on mount, not assumed, so it never
 * shows a button that would silently fail.
 */
export function NSCatalogShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable — the link is already visible on the page, so nothing is lost.
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ url, title });
    } catch {
      // User cancelled the share sheet — not an error worth surfacing.
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <NSButton type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? "¡Enlace copiado!" : "Copiar enlace"}
      </NSButton>
      {canShare ? (
        <NSButton type="button" variant="outline" size="sm" onClick={handleShare}>
          Compartir
        </NSButton>
      ) : null}
    </div>
  );
}
