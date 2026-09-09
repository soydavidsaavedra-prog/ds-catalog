import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin — DS Catalog" },
  robots: { index: false, follow: false },
};

/**
 * Wraps every /[tenant]/admin/* route (login, onboarding, and the
 * authenticated (shell) — see app/[tenant]/admin/(shell)/layout.tsx for
 * the auth check and sidebar) in DS Catalog's own platform identity (see
 * .ds-platform in app/globals.css), not the tenant's — the admin panel is
 * DS Catalog's product, run on behalf of a tenant, not the tenant's own
 * storefront (which keeps its accent override — see
 * app/[tenant]/(storefront)/layout.tsx, untouched). A tenant's real
 * colors still show up inside the admin wherever it previews their
 * actual storefront (e.g. the Hero editor's live preview) via the
 * `.tenant-preview` scope, applied locally by that component.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="ds-platform min-h-dvh">{children}</div>;
}
