"use client";

import { useState } from "react";
import { shareProduct, buildWhatsAppShareUrl, canWebShare } from "@/lib/utils/share";
import { cn } from "@/lib/utils/cn";

/**
 * "Compartir" everywhere a product can be shared — one component, not a
 * copy-pasted button per call site. On a device with the Web Share API
 * (mostly mobile), a tap opens the OS share sheet directly — that sheet
 * already offers WhatsApp itself, so no extra menu is needed there. Where
 * Web Share isn't available (most desktop browsers), the same tap opens a
 * small menu with the two things a desktop visitor actually wants:
 * WhatsApp (wa.me, no target number — they pick the contact) and copying
 * the link.
 */
export function NSShareButton({
  title,
  message,
  url,
  label = "Compartir producto",
  className,
}: {
  title: string;
  /** Share text WITHOUT the url — the OS share sheet and shareProduct() both append/attach the url on their own. */
  message: string;
  url: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (canWebShare()) {
      await shareProduct({ title, text: message, url });
      return;
    }
    setOpen((v) => !v);
  }

  async function handleCopy() {
    const result = await shareProduct({ title, text: message, url });
    if (result === "copied") {
      setCopied(true);
      setOpen(false);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex h-14 w-full items-center justify-center gap-2 rounded-control border border-border-strong px-6 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-foreground",
          className,
        )}
      >
        <ShareIcon />
        {copied ? "Enlace copiado" : label}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute bottom-full right-0 z-50 mb-2 flex w-60 flex-col overflow-hidden rounded-control border border-border bg-surface-elevated shadow-modal">
            <a
              href={buildWhatsAppShareUrl(`${message}\n\n${url}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              <WhatsAppIcon />
              Compartir por WhatsApp
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2.5 border-t border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              <LinkIcon />
              Copiar enlace
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="15" cy="5" r="2" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="15" cy="15" r="2" />
      <path strokeLinecap="round" d="m7 9 6-3M7 11l6 3" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-success" fill="currentColor" aria-hidden>
      <path d="M10 2a8 8 0 0 0-6.9 12l-1 3.6 3.7-1A8 8 0 1 0 10 2Zm0 1.5a6.5 6.5 0 0 1 5.4 10.1l-.2.3.6 2.2-2.3-.6-.3.2A6.5 6.5 0 1 1 10 3.5Zm-2.9 3.3c-.2 0-.4.1-.5.3-.2.2-.7.7-.7 1.6s.7 1.9.8 2c.1.1 1.4 2.1 3.3 3 1.6.7 1.9.6 2.3.5.4 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1l-.5-.3c-.2-.1-1.1-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.1-.4 0-.2-.1-.9-.3-1.6-1-.6-.6-1-1.3-1.1-1.5-.1-.2 0-.3.1-.4l.3-.4.2-.3c.1-.1 0-.3 0-.4l-.6-1.4c-.1-.3-.3-.3-.5-.3h-.4Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 11.5a3 3 0 0 0 4.2.2l2-2a3 3 0 0 0-4.2-4.2l-1 1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 8.5a3 3 0 0 0-4.2-.2l-2 2a3 3 0 0 0 4.2 4.2l1-1" />
    </svg>
  );
}
