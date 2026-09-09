import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Super Admin", template: "%s · Super Admin — DS Catalog" },
  robots: { index: false, follow: false },
};

/** DS Catalog's own platform identity (see .ds-platform in app/globals.css) — Super Admin is the platform's own control center, with no tenant to brand it after. */
export default function SuperadminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="ds-platform min-h-dvh">{children}</div>;
}
