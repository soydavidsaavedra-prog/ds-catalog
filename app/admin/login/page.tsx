import type { Metadata } from "next";
import { NSLogo } from "@/components/brand/NSLogo";
import { NSLoginForm } from "@/components/admin/NSLoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-4 text-ink-0">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <NSLogo id="ns-login" variant="mark" className="h-16 w-16" />
          <div>
            <p className="font-display text-xl uppercase tracking-wide">Panel administrativo</p>
            <p className="text-xs text-ink-400">El Nuevo Sánchez</p>
          </div>
        </div>
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6">
          <NSLoginForm />
        </div>
      </div>
    </div>
  );
}
