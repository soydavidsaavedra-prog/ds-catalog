import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";

const bodyFont = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const monoFont = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Root-level metadata is intentionally generic (DS Catalog, not any one
 * tenant's brand) — every tenant route overrides title/description/OG via
 * its own generateMetadata (see app/[tenant]/(storefront)/page.tsx and
 * friends), scoped to that tenant's own settings.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ds-catalog.vercel.app"),
  title: {
    default: "DS Catalog",
    template: "%s | DS Catalog",
  },
  description: "DS Catalog aloja catálogos y tiendas conversacionales independientes bajo un solo motor.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a09",
};

/**
 * True root layout — shared by the DS Catalog landing page, every
 * tenant's storefront, and every tenant's /admin. Deliberately minimal:
 * storefront chrome (header/footer/cart/WhatsApp) lives in
 * app/[tenant]/(storefront)/layout.tsx so neither the root landing page
 * nor any admin panel renders it.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
