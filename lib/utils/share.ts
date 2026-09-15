"use client";

export interface ShareTarget {
  title: string;
  text?: string;
  url: string;
}

/** wa.me with no target number — opens WhatsApp's own contact picker so the visitor chooses who to send it to, unlike the storefront's own order WhatsApp link (lib/whatsapp/order-message.ts), which always targets the tenant's number. */
export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** `"share" in navigator` (not `navigator.share`) on purpose — some DOM lib versions type `share` as a required method, which makes TS flag a truthiness check on the value itself as "always true" even though plenty of browsers still don't implement it at runtime. */
export function canWebShare(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}

export async function shareProduct(target: ShareTarget): Promise<"shared" | "copied" | "failed"> {
  if (canWebShare()) {
    try {
      await navigator.share(target);
      return "shared";
    } catch {
      // User cancelled the native share sheet — not an error worth surfacing.
      return "failed";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(target.url);
      return "copied";
    } catch {
      return "failed";
    }
  }

  return "failed";
}
