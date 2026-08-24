"use client";

export interface ShareTarget {
  title: string;
  text?: string;
  url: string;
}

export async function shareProduct(target: ShareTarget): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator !== "undefined" && navigator.share) {
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
