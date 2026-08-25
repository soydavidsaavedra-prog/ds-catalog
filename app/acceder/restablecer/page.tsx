import type { Metadata } from "next";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { NSResetPasswordForm } from "@/components/registro/NSResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  robots: { index: false, follow: false },
};

export default function RestablecerPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-4 text-ink-0">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <DSPlatformMark className="h-14 w-14" />
          <div>
            <p className="font-display text-xl uppercase tracking-wide">Nueva contraseña</p>
            <p className="text-xs text-ink-400">Crea una contraseña nueva para tu cuenta.</p>
          </div>
        </div>
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6">
          <NSResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
