import type { Metadata } from "next";
import Link from "next/link";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { NSRecuperarForm } from "@/components/registro/NSRecuperarForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function RecuperarPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-4 text-ink-0">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <DSPlatformMark className="h-14 w-14" />
          <div>
            <p className="font-display text-xl uppercase tracking-wide">Recuperar contraseña</p>
            <p className="text-xs text-ink-400">Te enviaremos un enlace a tu correo para crear una nueva.</p>
          </div>
        </div>
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6">
          <NSRecuperarForm />
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          <Link href="/acceder" className="font-semibold text-accent hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
