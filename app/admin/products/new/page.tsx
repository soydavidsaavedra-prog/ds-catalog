import DSHeading from "@/components/ui/DSHeading";
import DSProductForm from "@/components/admin/products/DSProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-8">

      <DSHeading
        title="Nuevo Producto"
        subtitle="Crear un nuevo producto."
      />

      <DSProductForm />

    </div>
  );
}