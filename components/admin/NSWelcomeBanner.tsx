"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Shown right after a successful login (accederAction redirects to
 * /admin?bienvenida=1 — see app/acceder/actions.ts signInAndRedirect).
 * Strips the query param from the URL right after mount so refreshing the
 * dashboard doesn't keep re-showing it, and disappears if the tenant
 * navigates away — no dismiss button needed since it's already this
 * short-lived by construction.
 */
export function NSWelcomeBanner({ brandName }: { brandName: string }) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-control border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-strong">
      <span>¡Bienvenido de nuevo, {brandName}!</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Cerrar"
        className="text-accent-strong/70 hover:text-accent-strong"
      >
        ✕
      </button>
    </div>
  );
}
