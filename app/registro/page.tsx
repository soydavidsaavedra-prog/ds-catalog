import type { Metadata } from "next";
import Link from "next/link";
import { NSRegisterForm } from "@/components/registro/NSRegisterForm";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";

export const metadata: Metadata = {
  title: "Crear mi catálogo — DS Catalog",
  description: "Registra tu negocio y ten tu propio catálogo con pedidos por WhatsApp en minutos.",
};

export default function RegistroPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-4 py-16 text-ink-0">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/">
            <DSPlatformMark className="h-14 w-14" />
          </Link>
          <Link href="/" className="font-display text-xl uppercase tracking-wide">
            DS Catalog
          </Link>
          <p className="text-xs text-ink-400">Crea tu catálogo y empieza a vender por WhatsApp</p>
        </div>
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6">
          <NSRegisterForm />
        </div>
      </div>
    </div>
  );
}
