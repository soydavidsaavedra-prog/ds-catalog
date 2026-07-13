import DSButton from "@/components/ui/DSButton";
import { storeEngine } from "@/engines/store/store.engine";

type Props = {
  productName: string;
  color: string;
  size?: number;
};

export default function DSWhatsAppButton({
  productName,
  color,
  size,
}: Props) {
  const message = encodeURIComponent(
`Hola 👋

Estoy interesado en el siguiente producto.

Producto: ${productName}
Color: ${color}
Talla: ${size}`
  );

  return (
    <DSButton
      href={`https://wa.me/${storeEngine.getWhatsApp()}?text=${message}`}
      fullWidth
    >
      Solicitar por WhatsApp
    </DSButton>
  );
}