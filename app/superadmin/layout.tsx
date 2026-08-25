import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Super Admin", template: "%s · Super Admin — DS Catalog" },
  robots: { index: false, follow: false },
};

export default function SuperadminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
