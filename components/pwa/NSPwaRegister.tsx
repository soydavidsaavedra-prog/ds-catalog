"use client";

import { useEffect } from "react";

/**
 * Registers the (deliberately minimal) service worker at /sw.js so Chrome/
 * Android counts this storefront as installable — its "Add to Home
 * Screen" criteria require a controlling service worker with a fetch
 * handler, iOS Safari doesn't need one at all. The service worker itself
 * does no caching (see public/sw.js) so this can't make a page look
 * stale; it exists purely to satisfy that installability check.
 */
export function NSPwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Best-effort — a failed registration just means no install prompt, never a broken page.
    });
  }, []);

  return null;
}
