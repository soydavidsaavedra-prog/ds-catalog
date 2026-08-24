import { getSettings } from "@/lib/repositories/settings-repository";
import { NSHeader } from "@/components/layout/NSHeader";
import { NSFooter } from "@/components/layout/NSFooter";
import { NSCartDrawer } from "@/components/cart/NSCartDrawer";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <NSHeader />
      <main className="flex-1">{children}</main>
      <NSFooter />
      <NSCartDrawer whatsappNumber={settings.whatsappNumber} />
      <NSWhatsAppButton whatsappNumber={settings.whatsappNumber} variant="floating" />
    </>
  );
}
