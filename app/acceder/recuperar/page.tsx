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
    <div className="ds-platform flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <DSPlatformMark className="h-14 w-14" />
          <div>
            <p className="font-display text-xl uppercase tracking-wide">Recuperar contraseña</p>
            <p className="text-xs text-muted-foreground">Te enviaremos un enlace a tu correo para crear una nueva.</p>
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface-elevated p-6">
          <NSRecuperarForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/acceder" className="font-semibold text-accent-strong hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
