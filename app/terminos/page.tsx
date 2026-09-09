import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlatformSettings } from "@/lib/repositories/platform-settings-repository";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { DSLegalContent } from "@/components/ui/DSLegalContent";

export const metadata: Metadata = {
  title: "Términos y condiciones",
};

/** DS Catalog's own Terms of Service — for businesses signing up at /registro, not any one tenant's storefront (see app/[tenant]/(storefront)/terminos for that). */
export default async function PlatformTermsPage() {
  const settings = await getPlatformSettings();
  if (!settings.termsContent.trim()) notFound();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center gap-2 px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <DSPlatformMark className="h-6 w-6" />
          <span className="font-display text-sm uppercase tracking-wide">DS Catalog</span>
        </Link>
      </header>
      <DSLegalContent title="Términos y condiciones" content={settings.termsContent} />
    </div>
  );
}
