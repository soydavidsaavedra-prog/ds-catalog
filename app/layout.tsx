import "./globals.css";
import type { Metadata } from "next";
import DSThemeProvider from "@/components/theme/DSThemeProvider";

export const metadata: Metadata = {
  title: "DS Catalog",
  description: "Conversational Commerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <DSThemeProvider>
          {children}
        </DSThemeProvider>
      </body>
    </html>
  );
}