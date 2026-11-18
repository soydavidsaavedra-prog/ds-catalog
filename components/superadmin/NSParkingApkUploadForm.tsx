"use client";

import { useRef, useState } from "react";
import { setParkingApkAction } from "@/app/superadmin/actions";
import { MAX_APK_UPLOAD_BYTES } from "@/lib/media/parking-apk-limits";

type Phase = "idle" | "signing" | "uploading" | "saving" | "error";

const MAX_MB = Math.round(MAX_APK_UPLOAD_BYTES / (1024 * 1024));

/**
 * Deliberately NOT a <form action={serverAction}> — the actual file never
 * goes through a server action or route handler, it's PUT straight from
 * the browser to the signed Supabase Storage URL (see
 * app/superadmin/api/apk/upload-url/route.ts for why: Vercel's ~4.5MB
 * request-body ceiling would reject anything resembling a real APK long
 * before this component's own code could run). This component drives all
 * three steps itself: sign -> PUT -> setParkingApkAction (metadata only).
 */
export function NSParkingApkUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.name.toLowerCase().endsWith(".apk")) {
      setError("El archivo debe ser un .apk");
      return;
    }
    if (file.size > MAX_APK_UPLOAD_BYTES) {
      setError(`El archivo debe pesar menos de ${MAX_MB}MB`);
      return;
    }

    try {
      setPhase("signing");
      const signRes = await fetch("/superadmin/api/apk/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
      });
      const signData = await signRes.json().catch(() => null);
      if (!signRes.ok || !signData?.signedUrl) {
        setError(signData?.error ?? "No se pudo preparar la subida");
        setPhase("error");
        return;
      }

      setPhase("uploading");
      const putRes = await fetch(signData.signedUrl, {
        method: "PUT",
        headers: { "content-type": file.type || "application/vnd.android.package-archive" },
        body: file,
      });
      if (!putRes.ok) {
        setError("No se pudo subir el archivo a Storage");
        setPhase("error");
        return;
      }

      setPhase("saving");
      const result = await setParkingApkAction({ path: signData.path, fileName: file.name, fileSize: file.size });
      if (result.error) {
        setError(result.error);
        setPhase("error");
        return;
      }

      setPhase("idle");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Ocurrió un error inesperado al subir el archivo");
      setPhase("error");
    }
  }

  const pending = phase === "signing" || phase === "uploading" || phase === "saving";
  const statusLabel =
    phase === "signing"
      ? "Preparando subida..."
      : phase === "uploading"
        ? "Subiendo archivo..."
        : phase === "saving"
          ? "Guardando..."
          : null;

  return (
    <div className="mt-4 flex flex-col gap-3">
      {error ? (
        <div className="rounded-control border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept=".apk"
        disabled={pending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className="text-sm text-muted-foreground file:mr-4 file:rounded-control file:border-0 file:bg-accent file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-accent-foreground hover:file:bg-accent-strong disabled:opacity-50"
      />
      {statusLabel ? <p className="text-xs text-muted-foreground">{statusLabel}</p> : null}
      <p className="text-xs text-muted-foreground">Máximo {MAX_MB}MB. Reemplaza el APK actual en /estacionamiento.</p>
    </div>
  );
}
