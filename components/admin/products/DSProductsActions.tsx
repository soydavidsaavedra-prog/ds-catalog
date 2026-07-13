import Link from "next/link";
import DSButton from "@/components/ui/DSButton";

type Props = {
  id: number;
};

export default function DSProductsActions({
  id,
}: Props) {
  return (
    <div className="flex justify-center gap-2">

      <Link href={`/admin/products/${id}/edit`}>
        <DSButton variant="secondary">
          Editar
        </DSButton>
      </Link>

      <DSButton variant="outline">
        Eliminar
      </DSButton>

    </div>
  );
}