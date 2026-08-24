import { cn } from "@/lib/utils/cn";

interface NSWhatsAppButtonProps {
  whatsappNumber: string;
  message?: string;
  className?: string;
  variant?: "solid" | "floating" | "inline";
  children?: React.ReactNode;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.372-.025-.521-.075-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.763.462 3.482 1.34 4.997L2 22l5.116-1.338a9.96 9.96 0 0 0 4.888 1.278h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.928-7.07a9.935 9.935 0 0 0-7.073-2.87zm0 18.174h-.003a8.16 8.16 0 0 1-4.166-1.14l-.299-.177-3.037.795.81-2.96-.194-.304a8.16 8.16 0 0 1-1.256-4.39c0-4.512 3.672-8.184 8.188-8.184a8.13 8.13 0 0 1 5.789 2.398 8.132 8.132 0 0 1 2.397 5.79c0 4.512-3.673 8.184-8.184 8.184z" />
    </svg>
  );
}

export function NSWhatsAppButton({
  whatsappNumber,
  message,
  className,
  variant = "solid",
  children,
}: NSWhatsAppButtonProps) {
  const href = message
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${whatsappNumber}`;

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-pill bg-[#25D366] text-white shadow-modal transition-transform duration-normal ease-out-ns hover:scale-105",
          className,
        )}
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent-strong",
          className,
        )}
      >
        <WhatsAppIcon className="h-4 w-4" />
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-accent text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-colors duration-normal hover:bg-accent-strong",
        className,
      )}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {children}
    </a>
  );
}
