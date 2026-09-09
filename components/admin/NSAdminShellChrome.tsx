import { NSAdminSidebar } from "@/components/admin/NSAdminSidebar";
import { NSPageTransition } from "@/components/ui/NSPageTransition";

/**
 * The sidebar + padded/contained main area every tenant admin page shares
 * — extracted so app/[tenant]/admin/(shell)/layout.tsx and
 * app/[tenant]/admin/cuenta/layout.tsx can render byte-for-byte the same
 * chrome without duplicating it. The two layouts differ only in the
 * server-side checks around this: (shell) redirects a frozen tenant to
 * /admin/suspended, cuenta deliberately never does (see that layout's own
 * comment for why) — this component itself has no opinion on freezing.
 */
export function NSAdminShellChrome({
  tenantSlug,
  logoSrc,
  brandName,
  tagline,
  impersonating,
  supportWhatsappNumber,
  banner,
  children,
}: {
  tenantSlug: string;
  logoSrc?: string;
  brandName: string;
  tagline: string;
  impersonating?: boolean;
  supportWhatsappNumber?: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <NSAdminSidebar
        tenantSlug={tenantSlug}
        logoSrc={logoSrc}
        brandName={brandName}
        tagline={tagline}
        impersonating={impersonating}
        supportWhatsappNumber={supportWhatsappNumber}
      />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
          {banner}
          <NSPageTransition>{children}</NSPageTransition>
        </main>
      </div>
    </div>
  );
}
