import DSHeading from "@/components/ui/DSHeading";
import DSCard from "@/components/ui/DSCard";
import DSInput from "@/components/ui/DSInput";
import DSButton from "@/components/ui/DSButton";
import { storeConfig } from "@/config/store";

export default function StorePage() {
  return (
    <div className="space-y-8">

      <DSHeading
        title="Configuración de la tienda"
        subtitle="Personaliza la información principal del negocio."
      />

      <DSCard>

        <div className="grid gap-6">

          <DSInput
            label="Nombre de la tienda"
            defaultValue={storeConfig.name}
          />

          <DSInput
            label="Eslogan"
            defaultValue={storeConfig.slogan}
          />

          <DSInput
            label="WhatsApp"
            defaultValue={storeConfig.whatsapp}
          />

          <DSInput
            label="Moneda"
            defaultValue={storeConfig.currency}
          />

          <DSInput
            label="Idioma"
            defaultValue={storeConfig.locale}
          />

          <DSInput
            label="Instagram"
            defaultValue={storeConfig.social.instagram}
          />

          <DSInput
            label="Facebook"
            defaultValue={storeConfig.social.facebook}
          />

          <DSInput
            label="TikTok"
            defaultValue={storeConfig.social.tiktok}
          />

          <DSInput
            label="Sitio web"
            defaultValue={storeConfig.social.website}
          />

          <div className="pt-4">
            <DSButton>
              Guardar cambios
            </DSButton>
          </div>

        </div>

      </DSCard>

    </div>
  );
}